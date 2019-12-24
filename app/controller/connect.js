/* eslint-disable quote-props */
'use strict';

const Controller = require('egg').Controller;
const sha1 = require('sha1');
const uuid = require('uuid/v4');
const moment = require('moment');
const code2Name = {
  '101': '四牌楼网络报障',
  '102': '九龙湖网络报障',
  '103': '丁家桥网络报障',
  '104': '宿舍区网络报障',
  '201': '信息系统报障',
  '211': '网站报障',
  '800': '核心故障报修',
  '900': '其他报障',
};
const name2Code = {
  四牌楼网络报障: '101',
  九龙湖网络报障: '102',
  丁家桥网络报障: '103',
  宿舍区网络报障: '104',
  信息系统报障: '201',
  网站报障: '211',
  核心故障报修: '800',
  其他报障: '900',
};
const status2Action = {
  'WAITING': 'submit',
  'PENDING': 'accept',
  'DONE': 'accomplish',
  'ACCEPT': 'confirm',
  'REJECT': 'reject',
};

async function checkToken(ctx) {
  const token = ctx.request.headers['x-api-token'];
  const record = await ctx.model.SeicToken.findOne({ token });
  const now = +moment();
  if (!record || record.expiresTime < now) {
    ctx.error(1, '访问凭据无效');
  }
}

class wiseduController extends Controller {
  async token() {
    const { ctx } = this;
    const { appId, timestamp, signature } = ctx.query;
    console.log(this.config.seicApiKey);
    if (appId !== this.config.seicApiKey) {
      ctx.error(1, 'appId 不正确');
    }
    const signatureCheck = sha1(appId + timestamp + this.config.seicSecret);
    if (signatureCheck !== signature) {
      ctx.error(2, '签名校验未通过');
    }
    // await ctx.model.SeicToken.deleteMany();
    const expiresIn = 2 * 60 * 60 * 1000;
    const newToken = new ctx.model.SeicToken({
      token: uuid(),
      expiresTime: +moment() + expiresIn,
    });
    await newToken.save();
    return {
      access_token: newToken.token,
      expiresIn: expiresIn / 1000,
    };
  }

  async submit() {
    await checkToken(this.ctx);
    let { id, sortId, desc, phonenum, address, image = null, createdTime, userCardnum, userName, staffCardnums } = this.ctx.request.body;
    if (!id) {
      this.ctx.paramsError('缺少 id 参数');
    }
    if (!code2Name[sortId]) {
      this.ctx.paramsError('指定的 sortId 不正确');
    }
    if (!desc) {
      this.ctx.paramsError('缺少 desc 参数');
    }
    if (!phonenum) {
      this.ctx.paramsError('缺少 phonenum 参数');
    }
    if (!userCardnum) {
      userCardnum = '东大服务台';
    }
    if (!address) {
      address = '(用户未填写)';
    }
    if (!createdTime) {
      createdTime = +moment();
    } else {
      createdTime = +createdTime;
    }
    if (image) {
      if (!image.startsWith('data:image/jpg;base64') && !image.startsWith('data:image/jpeg;base64') && !image.startsWith('data:image/png;base64')) {
        this.ctx.paramsError('附件格式不正确，必须为 jpeg 或 png 格式');
      }
    }
    const staffCardnum = this.ctx.helper.randomFromArray(staffCardnums.split(','));
    // 如果 id 已存在则去重
    await this.ctx.model.Trouble.deleteOne({ wiseduId: id });
    const typeName = code2Name['' + sortId];
    const typeRecord = await this.ctx.model.TroubleType.findOne({ displayName: typeName });
    // 检查故障类型
    if (!typeRecord) {
      this.ctx.error(1, '指定的故障类型不存在');
    }
    // 获取员工信息
    const staffRecord = await this.ctx.model.StaffBind.findOne({ departmentId: typeRecord.departmentId, staffCardnum });
    if (!staffRecord) {
      this.ctx.error(2, '指派的员工不存在或者不属于故障类型所属部门');
    }
    const record = new this.ctx.model.Trouble({
      createdTime,
      desc,
      status: 'WAITING', // 初始状态为WAITNG待受理
      phonenum,
      address,
      departmentId: typeRecord.departmentId,
      typeId: typeRecord._id,
      typeName: typeRecord.displayName,
      userCardnum,
      userName,
      staffCardnum,
      image,
      wiseduId: id,
    });
    await record.save();

    // 创建统计日志
    const statisticRecord = new this.ctx.model.Statistic({
      timestamp: createdTime,
      enterStatus: 'WAITING',
      troubleId: record._id,
      staffCardnum, // 操作运维人员一卡通
      typeId: typeRecord._id, // 故障类型名称
      departmentId: typeRecord.departmentId, // 所属部门Id
    });
    await statisticRecord.save();

    // 检查用户是否绑定微信报修平台
    const userRecord = await this.ctx.model.User.findOne({ cardnum: userCardnum });
    if (userRecord) {
      // 如果用户存在则向提交故障报修的用户推送正在处理通知
      await this.ctx.service.pushNotification.userNotification(
        userCardnum,
        '您申报的故障信息正在等待受理',
        address,
        typeRecord.displayName, // type
        `正在等待运维人员${staffRecord.name}（一卡通号：${staffCardnum}）受理`, // status
        moment(createdTime).format('YYYY-MM-DD HH:mm:ss'), // lastModifiedTime
        '运维人员已经收到您提交的故障信息，将尽快为您处理解决，期间请将您填写的联系方式保持畅通。',
        this.ctx.helper.oauthUrl(this.ctx, 'detail', record._id) // url - 故障详情页面
      );
    }

    // 向处理人员推送等待处理
    await this.ctx.service.pushNotification.staffNotification(
      staffCardnum,
      '有新的故障等待受理', // title
      record._id.toString().toUpperCase(), // code
      typeRecord.displayName, // type
      '点击查看', // desc
      phonenum,
      moment(createdTime).format('YYYY-MM-DD HH:mm:ss'),
      '故障描述信息：' + desc,
      this.ctx.helper.oauthUrl(this.ctx, 'detail', record._id) // url - 故障详情页面
    );

    return { seicwxbzId: record._id };
  }

  async accept() {
    // 受理事件
    // 查询故障信息
    await checkToken(this.ctx);
    const { ctx } = this;
    const { id, staffCardnums } = ctx.request.body;
    let staffCardnum = this.ctx.helper.randomFromArray(staffCardnums.split(','));
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    if (!staffCardnum) {
      staffCardnum = record.staffCardnum;
    }
    let isSameDepartment = false;
    // 只允许故障处理人将处于WAITING状态的故障标记为PENDING
    // 允许相同部门的故障处理人处理故障
    const resOfStaffBind = await ctx.model.StaffBind.find({ staffCardnum });
    if (resOfStaffBind.length !== 0) {
      resOfStaffBind.forEach(k => {
        if (record.departmentId === k.departmentId) isSameDepartment = true;
      });
    }
    if (record.status !== 'WAITING' || !isSameDepartment) {
      ctx.permissionError('无权操作');
    }
    record.staffCardnum = staffCardnum;
    record.status = 'PENDING';
    record.dealTime = +moment();
    await record.save();

    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: 'PENDING',
      id: record._id,
      staffCardnum, // 操作运维人员一卡通
      typeId: record.typeId, // 故障类型名称
      departmentId: record.departmentId, // 所属部门Id
    });
    await statisticRecord.save();

    // 向提交故障报修的用户推送处理完成
    await ctx.service.pushNotification.userNotification(
      record.userCardnum,
      '您报告的故障正在被处理，请稍候',
      record.address,
      record.typeName, // type
      '运维人员处理中', // status
      moment().format('YYYY-MM-DD HH:mm:ss'), // lastModifiedTime
      '运维人员正在处理您报告的故障，请保持联系畅通，并注意微信提醒',
      this.ctx.helper.oauthUrl(ctx, 'detail', record._id) // url - 故障详情页面
    );
    return 'ok';
  }

  async accomplish() {
    await checkToken(this.ctx);
    const { ctx } = this;
    const { id, summary } = ctx.request.body;
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    const staffCardnum = record.staffCardnum;
    let isSameDepartment = false;
    if (summary.length < 6) {
      ctx.error(2, '故障处理总结字数不足6字');
    }
    // 只允许故障处理人将处于PENDING状态的故障标记为DONE
    // 允许相同部门的故障处理人处理故障
    const resOfStaffBind = await ctx.model.StaffBind.find({ staffCardnum });
    if (resOfStaffBind.length !== 0) {
      resOfStaffBind.forEach(k => {
        if (record.departmentId === k.departmentId) isSameDepartment = true;
      });
    }
    if (record.status !== 'PENDING' || !isSameDepartment) {
      ctx.permissionError('无权操作');
    }
    record.staffCardnum = staffCardnum;
    record.status = 'DONE';
    record.dealTime = +moment();
    record.summary = summary;
    await record.save();

    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: 'DONE',
      id: record._id,
      staffCardnum, // 操作运维人员一卡通
      typeId: record.typeId, // 故障类型名称
      departmentId: record.departmentId, // 所属部门Id
    });
    await statisticRecord.save();
    // 向提交故障报修的用户推送处理完成
    await ctx.service.pushNotification.userNotification(
      record.userCardnum,
      '您报告的故障已处理完成',
      record.address,
      record.typeName, // type
      '处理完成', // status
      moment().format('YYYY-MM-DD HH:mm:ss'), // lastModifiedTime
      '运维人员已经完成对故障的处理，请您及时检查处理结果并填写对本次服务的评价',
      this.ctx.helper.oauthUrl(ctx, 'detail', record._id) // url - 故障详情页面
    );
    return 'ok';
  }

  async reject() {
    await checkToken(this.ctx);
    const { ctx } = this;
    const { id, comment } = ctx.request.body;
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    record.status = 'PENDING';
    await record.save();
    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: record.status,
      troubleId: record._id,
      staffCardnum: record.staffCardnum, // 操作运维人员一卡通
      typeId: record.typeId, // 故障类型名称
      departmentId: record.departmentId, // 所属部门Id
    });
    await statisticRecord.save();
    await ctx.service.pushNotification.staffNotification(
      record.staffCardnum,
      '用户提交的故障仍未解决，请尽快处理', // title
      record._id.toString().toUpperCase(), // code
      record.typeName, // type
      '点击查看', // desc
      record.phonenum,
      moment().format('YYYY-MM-DD HH:mm:ss'),
      comment ? '用户留言：' + comment : '故障描述：' + record.desc,
      this.ctx.helper.oauthUrl(ctx, 'detail', record._id) // url - 故障详情页面
    );
    return 'ok';
  }

  async hasten() {
    await checkToken(this.ctx);
    const { ctx } = this;
    const { id, comment } = ctx.request.body;
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    // 向负责人推送提醒
    await ctx.service.pushNotification.staffNotification(
      record.staffCardnum,
      '该故障长时间未处理，请尽快处理', // title
      record._id.toString().toUpperCase(), // code
      record.typeName, // type
      '点击查看', // desc
      record.phonenum,
      moment(record.createdTime).format('YYYY-MM-DD HH:mm:ss'),
      comment ? '用户留言：' + comment : '故障描述：' + record.desc,
      this.ctx.helper.oauthUrl(ctx, 'detail', record._id)
    );
    return 'ok';
  }

  async confirm() {
    await checkToken(this.ctx);
    const { ctx } = this;
    const { id, level, comment } = ctx.request.body;
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    record.status = 'ACCEPT';
    record.checkTime = +moment();
    record.evaluation = comment;
    record.evaluationLevel = level;
    await record.save();
    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: record.status,
      troubleId: record._id,
      staffCardnum: record.staffCardnum, // 操作运维人员一卡通
      typeId: record.typeId, // 故障类型名称
      departmentId: record.departmentId, // 所属部门Id
    });
    await statisticRecord.save();
    return 'ok';
  }

  async redirect() {
    await checkToken(this.ctx);
    const { ctx } = this;
    let { id, sortId = '', staffCardnums } = ctx.request.body;
    const staffCardnum = this.ctx.helper.randomFromArray(staffCardnums.split(','));
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (!record) {
      // 判定故障信息是否存在
      ctx.error(1, '故障信息不存在');
    }
    if (!sortId) {
      sortId = name2Code[record.typeName];
    } else {
      if (Object.keys(code2Name).indexOf(sortId) === -1) {
        ctx.error(2, '故障类型不存在');
      }
    }

    const troubleType = await ctx.model.TroubleType.findOne({ displayName: code2Name[sortId] });
    record.typeName = code2Name[sortId];
    record.typeId = troubleType._id;
    record.departmentId = troubleType.departmentId;
    const staffRecord = await ctx.model.StaffBind.findOne({ departmentId: troubleType.departmentId, staffCardnum });
    if (!staffRecord) {
      // 判定运维人员是否存在
      ctx.error(3, '运维人员不存在或不负责指定的故障类型');
    }
    record.staffCardnum = staffRecord.staffCardnum;
    await record.save();

    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: record.status,
      troubleId: record._id,
      staffCardnum: record.staffCardnum, // 操作运维人员一卡通
      typeId: record.typeId, // 故障类型名称
      departmentId: record.departmentId, // 所属部门Id
    });
    await statisticRecord.save();

    // 向处理人员推送等待处理
    await ctx.service.pushNotification.staffNotification(
      staffRecord.staffCardnum,
      '有新的故障报修等待处理', // title
      record._id.toString().toUpperCase(), // code
      record.typeName, // type
      '点击查看', // desc
      record.phonenum,
      moment(record.createdTime).format('YYYY-MM-DD HH:mm:ss'),
      '故障描述：' + record.desc,
      this.ctx.helper.oauthUrl(ctx, 'detail', record._id)
    );
    return 'ok';
  }

  async message() {
    await checkToken(this.ctx);
    const { ctx } = this;
    const { id, fromWho, fromWhoName, content } = ctx.request.body;
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (!record) {
      // 判断故障是否存在
      ctx.error(2, '故障信息不存在');
    }
    if (!(fromWho && fromWhoName)) {
      // 判断消息来源是否完整
      ctx.error(1, '信息不完整');
    }
    if (record.userCardnum === fromWho) {
      // 消息来自用户
      const newChatInfo = ctx.model.ChatInfo({
        time: +moment(),
        fromWho: 'user',
        troubleId: id,
        content,
        fromWhoName,
      });
      await newChatInfo.save();
      // 向运维人员推送消息
      ctx.service.pushNotification.staffNotification(
        record.staffCardnum,
        `用户${record.userCardnum}对反馈的问题进行了补充，请注意查看`,
        record._id.toString().toUpperCase(),
        record.typeName,
        record.desc,
        record.phonenum,
        moment(record.createdTime).format('YYYY-MM-DD HH:mm:ss'),
        '消息内容：' + content,
        this.ctx.helper.oauthUrl(ctx, 'detail', record._id) // url - 故障详情页面
      );
      return { seicwxbzMessageId: newChatInfo._id };
    }

    // 实在不想仔细鉴权了。。。。
    // 消息来自运维人员/部门管理员/系统管理员
    const newChatInfo = new ctx.model.ChatInfo({
      time: +moment(),
      fromWho: 'staff',
      troubleId: id,
      content,
      fromWhoName,
    });
    await newChatInfo.save();
    // 向用户推送消息
    const now = +moment();
    ctx.service.pushNotification.userNotification(
      record.userCardnum,
      '亲爱的用户您好，针对你反馈的问题，运维人员的有了新的回复，请即时查看',
      record.address,
      record.typeName,
      '故障处理中',
      moment(now).format('YYYY-MM-DD HH:mm:ss'),
      '消息内容：' + content,
      this.ctx.helper.oauthUrl(ctx, 'detail', record._id)
    );
    return { seicwxbzMessageId: newChatInfo._id };
  }

  async modify() {
    await checkToken(this.ctx);
    const { ctx } = this;
    const { id, desc, image, address, phonenum } = ctx.request.body;
    const record = await ctx.model.Trouble.findOne({ wiseduId: id });
    if (desc) {
      record.desc = desc;
    }
    if (image) {
      record.image = image;
    }
    if (address) {
      record.address = address;
    }
    if (phonenum) {
      record.phonenum = phonenum;
    }
    await record.save();
    return 'ok';
  }

  async sync() {
    await checkToken(this.ctx);
    const { ctx } = this;
    const { startDate, endDate } = ctx.request.query;
    const startTime = +moment(startDate + ' 00:00:00', 'YYYY-MM-DD HH:mm:ss');
    const endTime = +moment(endDate + ' 23:59:59', 'YYYY-MM-DD HH:mm:ss');
    if (endTime <= startTime) {
      ctx.paramsError('截止时间必须大于起始时间');
    }
    // 按照提报时间筛选
    const troubleRecords = await this.ctx.model.Trouble.find({ createdTime: { $gte: startTime, $lte: endTime } },
      [ '_id', 'desc', 'status', 'phonenum', 'summary', 'address', 'typeName', 'staffCardnum', 'userCardnum', 'userName', 'dealTime', 'checkTime', 'image', 'wiseduId', 'evaluation', 'evaluationLevel' ]
    );
    const list = [];
    for (const troubleRecord of troubleRecords) {
      const r = {
        '_id': troubleRecord._id,
        'desc': troubleRecord.desc,
        'phonenum': troubleRecord.phonenum,
        'address': troubleRecord.address,
        'sortId': name2Code[troubleRecord.typeName],
        'staffCardnum': troubleRecord.staffCardnum,
        'userCardnum': troubleRecord.userCardnum,
        'userName': troubleRecord.userName,
        'image': troubleRecord.image ? `https://seicwxbz.seu.edu.cn/api/trouble/wechat-image?troubleId=${troubleRecord._id}` : null,
        'wiseduId': troubleRecord.wiseduId,
        'status': status2Action[troubleRecord.status],
      };
      // 查找 staff 姓名
      console.log(troubleRecord);
      const staffRecord = await this.ctx.model.StaffBind.findOne({ staffCardnum: troubleRecord.staffCardnum });
      r.staffName = staffRecord.name;
      let events = [];
      // 查找所有动作记录
      const logRecords = await this.ctx.model.Statistic.find({ troubleId: troubleRecord._id });
      logRecords.forEach(lr => {
        if (!status2Action[lr.enterStatus]) {
          // 忽略不关心的状态
          return;
        }
        const event = {
          action: status2Action[lr.enterStatus],
          timestamp: lr.timestamp,
        };
        if (lr.enterStatus === 'DONE') {
          event.content = { summary: troubleRecord.summary };
        }
        if (lr.enterStatus === 'ACCEPT') {
          event.content = { level: troubleRecord.evaluationLevel, comment: troubleRecord.evaluation };
        }
        events.push(event);
      });
      const messageRecords = await this.ctx.model.ChatInfo.find({ troubleId: troubleRecord._id });
      for (const mr of messageRecords) {
        events.push({
          action: 'reply',
          timestamp: mr.time,
          content: {
            cardnum: mr.fromWho,
            name: mr.fromWhoName,
            role: mr.fromWho === troubleRecord.userCardnum ? 'USER' : 'STAFF',
            content: mr.content,
          },
        });
      }
      events = events.sort((a, b) => a.timestamp - b.timestamp);
      r.events = events;
      list.push(r);
    }
    return list;
  }
}

module.exports = wiseduController;
