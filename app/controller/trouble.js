'use strict';
const moment = require('moment');
const Controller = require('egg').Controller;

const statusDisp = {
  WAITING: '待受理',
  PENDING: '处理中',
  DONE: '处理完成，等待验收',
  ACCEPT: '故障已解决',
  REJECT: '故障仍未解决',
  CLOSED: '已关闭',
  SPAM: '无效信息',
};

class TroubleController extends Controller {
  async post() {
    // 故障报修
    const { ctx } = this;
    let { typeId, desc, phonenum, address, image } = ctx.request.body;
    if (!ctx.userInfo.cardnum) {
      ctx.identityError('需要先绑定信息才能报修');
    }
    // 判断是否频率过高
    const userCardnum = ctx.userInfo.cardnum;
    const now = +moment();
    const postCount = await ctx.model.Trouble.countDocuments({
      userCardnum,
      createdTime: { $gt: now - 24 * 60 * 60 * 1000 },
    });
    if (postCount > 50) {
      // 为了避免恶意骚扰，24小时内故障申报数量不能超过5个
      ctx.error(1, '故障申报频率过高，请稍后重试');
    }
    if (!typeId) {
      ctx.error(3, '请指定故障申报类型');
    }
    // 验证参数
    if (!desc) {
      ctx.error(2, '请填写故障描述信息');
    }
    // 根据故障类型查找所属部门
    const troubleType = await ctx.model.TroubleType.findOne({
      _id: ctx.helper.ObjectId(typeId),
      delete: false,
    });
    if (!troubleType) {
      ctx.error(2, '指定的故障类型不存在');
    }
    const departmentId = troubleType.departmentId;
    // 获取部门员工列表
    const staffList = await ctx.model.StaffBind.find({ departmentId });
    // 获取部门管理员列表
    const adminList = await ctx.model.DepartmentAdminBind.find({ departmentId });

    // 故障提交，推送给部门员工，不推送给部门管理员
    let list = staffList.filter(staff => {
      let isadmin = false;
      adminList.forEach(admin => {
        isadmin = (admin.adminCardnum === staff.staffCardnum);
      });
      return !isadmin;
    });

    // 如果所有运维人员都是管理员，那就一视同仁
    if (list.length === 0) {
      list = staffList;
    }
    // 随机抽取一个幸运儿，把这个任务派给他
    const luckyDog = ctx.helper.randomFromArray(list);

    if (address) {
      ctx.userInfo.address = address;
      await ctx.userInfo.save();
    }

    address = ctx.userInfo.address;

    if (phonenum) {
      ctx.userInfo.phonenum = phonenum;
      await ctx.userInfo.save();
    }

    phonenum = ctx.userInfo.phonenum;

    // 从微信服务器下载图片
    image = await this.ctx.service.fetchWechatMedia.image(image);
    const trouble = new ctx.model.Trouble({
      createdTime: now,
      desc,
      status: 'WAITING', // 初始状态为WAITNG待受理
      phonenum,
      address,
      departmentId,
      typeId,
      typeName: troubleType.displayName,
      userCardnum,
      staffCardnum: luckyDog.staffCardnum,
      image,
    });

    await trouble.save();

    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: now,
      enterStatus: 'WAITING',
      troubleId: trouble._id,
      staffCardnum: luckyDog.staffCardnum, // 操作运维人员一卡通
      typeId, // 故障类型名称
      departmentId, // 所属部门Id
    });
    await statisticRecord.save();

    // 向提交故障报修的用户推送正在处理通知
    await ctx.service.pushNotification.userNotification(
      userCardnum,
      '您申报的故障信息正在等待受理',
      address,
      troubleType.displayName, // type
      `正在等待运维人员${luckyDog.name}（一卡通号：${luckyDog.staffCardnum}）受理`, // status
      moment(now).format('YYYY-MM-DD HH:mm:ss'), // lastModifiedTime
      '运维人员已经收到您提交的故障信息，将尽快为您处理解决，期间请将您填写的联系方式保持畅通。',
      this.ctx.helper.oauthUrl(ctx, 'detail', trouble._id) // url - 故障详情页面
    );
    // 向处理人员推送等待处理
    await ctx.service.pushNotification.staffNotification(
      luckyDog.staffCardnum,
      '有新的故障等待受理', // title
      trouble._id.toString().toUpperCase(), // code
      troubleType.displayName, // type
      '点击查看', // desc
      phonenum,
      moment(now).format('YYYY-MM-DD HH:mm:ss'),
      '故障描述信息：' + desc,
      this.ctx.helper.oauthUrl(ctx, 'detail', trouble._id) // url - 故障详情页面
    );
    return '提交成功';
  }

  async list() {
    // 查询故障列表
    const { ctx } = this;
    let { statusFilter = 'WAITING', role, page = 1, pagesize = 10 } = ctx.request.query;
    page = +page;
    pagesize = +pagesize;
    if (statusFilter === 'END') {
      statusFilter = [{ status: 'ACCEPT' }, { status: 'REJECT' }, { status: 'CLOSED' }];
    } else {
      statusFilter = [{ status: statusFilter }];
    }
    if (role === 'USER') {
      // 用户查询的逻辑
      const record = await ctx.model.Trouble.find({
        userCardnum: ctx.userInfo.cardnum,
        $or: statusFilter,
      }, [ '_id', 'createdTime', 'typeName', 'status', 'desc' ], {
        skip: pagesize * (page - 1),
        limit: pagesize,
        sort: { createdTime: -1 },
      });
      return record.map(r => {
        r.statusDisp = statusDisp[r.status];
        return r;
      });
    } else if (role === 'STAFF') {
      // 工作人员可以查询到本部门所有的故障信息
      const staffDepartments = await ctx.model.StaffBind.find({ staffCardnum: ctx.userInfo.cardnum });
      // 部门管理员可以看到本部门的故障信息
      const adminDepartments = await ctx.model.DepartmentAdminBind.find({ adminCardnum: ctx.userInfo.cardnum });
      const departments = staffDepartments.concat(adminDepartments);
      let departmentIds = {};
      departments.forEach(d => {
        departmentIds[d.departmentId] = true;
      });
      departmentIds = Object.keys(departmentIds);
      // 查询该部门下面的所有故障信息,根据部门id进行寻找
      const record = [];
      for (const departmentId of departmentIds) {
        const temp = await ctx.model.Trouble.find({
          departmentId,
          $or: statusFilter,
        }, [ '_id', 'createdTime', 'typeName', 'status', 'desc' ], {
          skip: pagesize * (page - 1),
          limit: pagesize,
          sort: { createdTime: -1 },
        });

        temp.forEach(k => {
          record.push(k);
        });

      }

      return record.map(r => {
        r.statusDisp = statusDisp[r.status];
        return r;
      });
    } else if (role === 'ADMIN') {
      if (!ctx.userInfo.isAdmin) {
        ctx.permissionError('无权访问');
      }
      // 管理员查询的逻辑
      const record = await ctx.model.Trouble.find({
        $or: statusFilter,
      }, [ '_id', 'createdTime', 'typeName', 'status', 'desc' ], {
        skip: pagesize * (page - 1),
        limit: pagesize,
        sort: { createdTime: -1 },
      });
      return record.map(r => {
        r.statusDisp = statusDisp[r.status];
        return r;
      });
    }
    return [];

  }

  async detail() {
    // 查询故障信息
    const { ctx } = this;
    const { troubleId } = ctx.query;
    const cardnum = ctx.userInfo.cardnum;
    const record = await ctx.model.Trouble.findById(troubleId);
    let isSameDepartment = false;
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    // 只允许用户本人、相同部门的故障处理人、管理员查看故障详细信息
    // 允许相同部门工作人员查看故障信息
    const resOfStaffBind = await ctx.model.StaffBind.find({ staffCardnum: cardnum });
    if (resOfStaffBind.length !== 0) {
      resOfStaffBind.forEach(k => {
        if (k.departmentId === record.departmentId) isSameDepartment = true;
      });
    }
    // 允许部门管理员转发消息
    let isDepartmentAdmin = false;
    const resOfDepartmentAdminBind = await ctx.model.DepartmentAdminBind.find({ adminCardnum: cardnum });
    if (resOfDepartmentAdminBind.length !== 0) {
      resOfDepartmentAdminBind.forEach(k => {
        isDepartmentAdmin = (k.departmentId === record.departmentId);
      });
    }


    if (record.userCardnum !== cardnum && !isSameDepartment && !ctx.userInfo.isAdmin && !isDepartmentAdmin) {
      ctx.permissionError('无权访问');
    }

    const staffInfo = await ctx.model.StaffBind.findOne({ staffCardnum: record.staffCardnum });
    return {
      troubleId,
      typeName: record.typeName,
      createdTime: record.createdTime,
      desc: record.desc,
      phonenum: record.phonenum,
      address: record.address,
      image: record.image,
      userCardnum: record.userCardnum,
      statusDisp: statusDisp[record.status],
      canPostMessage: record.status === 'PENDING',
      canAccept: (isSameDepartment || isDepartmentAdmin) && record.status === 'WAITING', // 允许受理
      canDeal: (isSameDepartment || isDepartmentAdmin) && record.status === 'PENDING', // 允许相同部门的人员处理
      canRemind: record.status === 'PENDING' && record.userCardnum === cardnum, // 用户催单
      canRedirect: (record.staffCardnum === cardnum || ctx.userInfo.isAdmin || isDepartmentAdmin) && (record.status === 'PENDING' || record.status === 'WAITING'),
      canCheck: record.status === 'DONE' && record.userCardnum === cardnum,
      canCancel: record.status === 'WAITING' && record.userCardnum === cardnum, // 用户取消故障报修
      showEvaluation: !!record.evaluation,
      dealTime: record.dealTime,
      departmentId: record.departmentId,
      evaluationLevel: record.evaluationLevel, // 用户评级
      evaluation: record.evaluation, // 用户评价
      staffCardnum: record.staffCardnum,
      staffName: staffInfo ? staffInfo.name : '',
    };
  }

  async accept() {
    // 工作人员标记故障受理
    // 查询故障信息
    const { ctx } = this;
    const { troubleId } = ctx.request.body;
    const cardnum = ctx.userInfo.cardnum;
    const record = await ctx.model.Trouble.findById(troubleId);
    let isSameDepartment = false;
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    // 只允许故障处理人将处于WAITING状态的故障标记为PENDING
    // 允许相同部门的故障处理人处理故障
    const resOfStaffBind = await ctx.model.StaffBind.find({ staffCardnum: cardnum });
    if (resOfStaffBind.length !== 0) {
      resOfStaffBind.forEach(k => {
        if (record.departmentId === k.departmentId) isSameDepartment = true;
      });
    }
    if (record.status !== 'WAITING' || !isSameDepartment) {
      ctx.permissionError('无权操作');
    }
    record.staffCardnum = cardnum;
    record.status = 'PENDING';
    record.dealTime = +moment();
    await record.save();

    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: 'PENDING',
      troubleId,
      staffCardnum: cardnum, // 操作运维人员一卡通
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

  }

  async deal() {
    // 工作人员标记故障处理完成
    // 查询故障信息
    const { ctx } = this;
    const { troubleId } = ctx.request.body;
    const cardnum = ctx.userInfo.cardnum;
    const record = await ctx.model.Trouble.findById(troubleId);
    let isSameDepartment = false;
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    // 只允许故障处理人将处于PENDING状态的故障标记为DONE
    // 允许相同部门的故障处理人处理故障
    const resOfStaffBind = await ctx.model.StaffBind.find({ staffCardnum: cardnum });
    if (resOfStaffBind.length !== 0) {
      resOfStaffBind.forEach(k => {
        if (record.departmentId === k.departmentId) isSameDepartment = true;
      });
    }
    if (record.status !== 'PENDING' || !isSameDepartment) {
      ctx.permissionError('无权操作');
    }
    record.staffCardnum = cardnum;
    record.status = 'DONE';
    record.dealTime = +moment();
    await record.save();
    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: 'DONE',
      troubleId,
      staffCardnum: cardnum, // 操作运维人员一卡通
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

  }

  async check() {
    // 用户验收故障处理结果
    // 查询故障信息
    const { ctx } = this;
    let { troubleId, evaluation, evaluationLevel = 5, accept } = ctx.request.body;
    if (!evaluation) {
      evaluation = '用户未填写意见建议';
    }
    const cardnum = ctx.userInfo.cardnum;
    const record = await ctx.model.Trouble.findById(troubleId);
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    // 只允许故障信息提交者将处于DONE状态
    if (record.status !== 'DONE' || record.userCardnum !== cardnum) {
      ctx.permissionError('无权操作');
    }
    record.status = accept ? 'ACCEPT' : 'REJECT';
    record.checkTime = +moment();
    record.evaluation = evaluation;
    record.evaluationLevel = evaluationLevel;
    await record.save();
    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: record.status,
      troubleId,
      staffCardnum: record.staffCardnum, // 操作运维人员一卡通
      typeId: record.typeId, // 故障类型名称
      departmentId: record.departmentId, // 所属部门Id
    });
    await statisticRecord.save();
    // 问题没有解决，自动创建一个新的故障信息，并向用户和维修人员推送模版消息
    // console.log('accept:' + accept);
    if (!accept) {
      const newTrouble = new ctx.model.Trouble({
        createdTime: +moment(),
        desc: record.desc,
        status: 'PENDING',
        phonenum: record.phonenum,
        address: record.address,
        departmentId: record.departmentId,
        typeId: record.typeId,
        typeName: record.typeName,
        staffCardnum: record.staffCardnum, // 默认还是上一个维修人员
        userCardnum: record.userCardnum,
        image: record.image,
      });
      // console.log('newTrouble:' + newTrouble);
      await newTrouble.save();
      const staff = await ctx.model.User.findOne({ cardnum: newTrouble.staffCardnum });
      console.log('staff:' + staff);
      // 向用户推送重新申请故障的推送消息
      await ctx.service.pushNotification.userNotification(
        newTrouble.userCardnum,
        '您申报的故障未解决，为您重新提交故障信息',
        newTrouble.address,
        newTrouble.typeName, // type
        `正在等待运维人员${staff.name}（一卡通号：${newTrouble.staffCardnum}）受理`, // status
        moment().format('YYYY-MM-DD HH:mm:ss'), // lastModifiedTime
        '运维人员已经收到您提交的故障信息，将尽快为您处理解决，期间请将您填写的联系方式保持畅通。',
        this.ctx.helper.oauthUrl(ctx, 'detail', newTrouble._id) // url - 故障详情页面
      );
      // 向运维人员推送故障未解决的消息
      await ctx.service.pushNotification.staffNotification(
        newTrouble.staffCardnum,
        '用户提交的故障仍未解决，请尽快处理', // title
        newTrouble._id.toString().toUpperCase(), // code
        newTrouble.typeName, // type
        '点击查看', // desc
        newTrouble.phonenum,
        moment().format('YYYY-MM-DD HH:mm:ss'),
        '故障描述信息：' + newTrouble.desc,
        this.ctx.helper.oauthUrl(ctx, 'detail', newTrouble._id) // url - 故障详情页面
      );
      // 创建统计日志
      const statisticRecord = new ctx.model.Statistic({
        timestamp: +moment(),
        enterStatus: newTrouble.status,
        troubleId: newTrouble._id,
        staffCardnum: newTrouble.staffCardnum, // 操作运维人员一卡通
        typeId: newTrouble.typeId, // 故障类型名称
        departmentId: newTrouble.departmentId, // 所属部门Id
      });
      // console.log('statisticRecord:' + statisticRecord);
      await statisticRecord.save();
      // console.log('ok！');

    }
    return '评价成功！';
  }

  async redirect() {
    // 转发故障任务信息
    // 查询故障信息
    const { ctx } = this;
    const { troubleId, staffBindId, typeId } = ctx.request.body;
    const cardnum = ctx.userInfo.cardnum;
    const record = await ctx.model.Trouble.findById(troubleId);
    if (!record) {
      ctx.error(1, '故障信息不存在');
    }
    const isDepartmentAdmin = !!(await ctx.model.DepartmentAdminBind.findOne({ adminCardnum: ctx.userInfo.cardnum, departmentId: record.departmentId }));
    // 只允许转发处于WAITING / PENDING状态的故障信息
    // 系统管理员、当前故障处理人员、部门管理员可以转发
    if (!((record.status === 'WAITING' || record.status === 'PENDING') && (isDepartmentAdmin || ctx.userInfo.isAdmin || record.staffCardnum === cardnum))) {
      ctx.permissionError('无权操作');
    }
    // 检查指定用户是否为系统内的运维人员
    const staffBind = await ctx.model.StaffBind.findById(staffBindId);
    if (!staffBind) {
      ctx.error(2, '指定的用户不属于运维人员');
    }
    // 确定转发后的故障类型
    const troubleType = await ctx.model.TroubleType.findById(typeId);
    if (troubleType.departmentId !== staffBind.departmentId) {
      ctx.error(3, '指定的员工不属于故障类型所属部门');
    }
    // 更新故障记录信息
    record.staffCardnum = staffBind.staffCardnum;
    record.departmentId = staffBind.departmentId;
    record.typeName = troubleType.displayName;
    await record.save();

    // 创建统计日志
    const statisticRecord = new ctx.model.Statistic({
      timestamp: +moment(),
      enterStatus: record.status,
      troubleId,
      staffCardnum: record.staffCardnum, // 操作运维人员一卡通
      typeId: record.typeId, // 故障类型名称
      departmentId: record.departmentId, // 所属部门Id
    });
    await statisticRecord.save();

    // 向处理人员推送等待处理
    await ctx.service.pushNotification.staffNotification(
      staffBind.staffCardnum,
      '有新的故障报修等待处理', // title
      record._id.toString().toUpperCase(), // code
      record.typeName, // type
      '点击查看', // desc
      record.phonenum,
      moment(record.createdTime).format('YYYY-MM-DD HH:mm:ss'),
      '故障描述：' + record.desc,
      this.ctx.helper.oauthUrl(ctx, 'detail', record._id)
    );

    return '转发成功';
  }

  async remind() {
    const { ctx } = this;
    const { troubleId } = ctx.request.body;
    const now = +moment();
    const trouble = await ctx.model.Trouble.findById(troubleId);
    if (!trouble) {
      ctx.error(1, '未查询到故障信息');
    }
    if (trouble.userCardnum !== ctx.userInfo.cardnum) {
      ctx.identityError('非用户本人，禁止操作');
    }
    // 一个小时最多3次
    const remindCount = await ctx.model.RemindInfo.countDocuments({ troubleId, createTime: { $gt: now - 60 * 60 * 1000 } });
    if (remindCount >= 3) {
      ctx.error(2, '提醒过于频繁，请稍候');
    }
    // 新建提醒记录
    const newRemindInfo = new ctx.model.RemindInfo({
      troubleId,
      createTime: now,
    });
    await newRemindInfo.save();
    // 向负责人推送提醒
    await ctx.service.pushNotification.staffNotification(
      trouble.staffCardnum,
      '该故障长时间未处理，请尽快处理', // title
      trouble._id.toString().toUpperCase(), // code
      trouble.typeName, // type
      '点击查看', // desc
      trouble.phonenum,
      moment(trouble.createdTime).format('YYYY-MM-DD HH:mm:ss'),
      '故障描述：' + trouble.desc,
      this.ctx.helper.oauthUrl(ctx, 'detail', trouble._id)
    );

    return '提醒成功';

  }

  async delete() {
    const { ctx } = this;
    const { troubleId } = ctx.query;
    const trouble = await ctx.model.Trouble.findById(troubleId);
    if (!trouble) {
      ctx.error(1, '未查询到故障信息');
    }
    if (trouble.userCardnum !== ctx.userInfo.cardnum) {
      ctx.identityError('非用户本人，禁止操作');
    }
    await ctx.model.Trouble.deleteOne({ _id: troubleId });

    return '删除成功';
  }

  async wechatImage() {
    const { ctx } = this;
    const { troubleId } = ctx.query;
    const record = await ctx.model.Trouble.findById(troubleId);
    if (record.image) {
      ctx.type = record.image.split(';')[0].split('/')[1];
      ctx.status = 200;
      const image = Buffer.from(record.image.split(';')[1]);
      ctx.body = image;
      ctx.length = image.length;
    } else {
      ctx.status = 404;
    }
  }
}

module.exports = TroubleController;
