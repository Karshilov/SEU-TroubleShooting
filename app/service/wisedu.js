'use strict';
const Service = require('egg').Service;
const moment = require('moment');
const axios = require('axios');
const qs = require('querystring');

const name2Code = {
  四牌楼网络报障: '101',
  九龙湖网络报障: '102',
  丁家桥网络报障: '103',
  宿舍区网络报障: '104',
  信息系统报障: '201',
  网站报障: '211',
  核心故障报修: '800',
  其它报障: '900',
};

const thirdParty = '3';

class WiseduService extends Service {
  async getToken() {
    let now = +moment(); // 当前时间
    const record = await this.ctx.model.WiseduToken.findOne({});
    if (record && (record.expiresTime > now)) {
      this.ctx.logger.info('使用缓存的wisedu_access_token');
      return record.token;
    }
    await this.ctx.model.WiseduToken.deleteMany({});
    this.ctx.logger.info('重新请求wisedu_access_token');
    const url = `https://coca.wisedu.com/common-app/token?apiKey=${this.config.wiseduApiKey}&secret=${this.config.wiseduSecret}`;
    let result = await axios.get(url);
    this.ctx.logger.info('获取到东大服务台 token: %j', result.data);
    result = result.data;
    now = +moment();
    const newToken = new this.ctx.model.WiseduToken({
      token: result.data.apiToken,
      expiresTime: now + (result.data.expiresIn - 200) * 1000,
    });
    await newToken.save();
    return result.data.apiToken;
  }

  async submit(mongoId, desc, typeName, userName, userCardnum, createdTime, imageUrl = null, phonenum, address, staffCardnum, staffName) {
    // 故障提交
    this.ctx.logger.info('向东大服务台推送故障提报，故障单号：%s', mongoId);
    const url = this.config.wiseduServer + 'submit';
    const wiseduToken = await this.getToken();
    let res;
    let attempt = 0;
    while (attempt < 3) {
      try {
        res = await axios.post(url, qs.stringify({
          id: '' + mongoId,
          title: typeName,
          summary: desc,
          sortCode: name2Code[typeName],
          level: 1,
          source: 1,
          reporter: userName,
          reporterCode: userCardnum,
          reportTime: createdTime,
          file: imageUrl,
          thirdParty,
          creatorCode: userCardnum,
          reporterMobile: phonenum,
          address,
          reporterType: userCardnum[0],
          acceptUserCodes: staffCardnum,
          acceptUserNames: staffName,
          acceptUserTypes: staffCardnum[0],
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        console.log(res);
        if (res.data.state === 'success') {
          this.ctx.logger.info('向东大服务台推送故障提报成功，故障单号：%s', mongoId);
          return res.data.data; // 金智服务台的报障id
        }
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
  // 之后传入的 id 全是 mongoDB ObjectId
  async accept(mongoId) {
    // 故障受理
    this.ctx.logger.info('向东大服务台推送故障受理，故障单号：%s', mongoId);
    const record = await this.ctx.model.Trouble.findById(mongoId);
    const wiseduToken = await this.getToken();
    if (!record) {
      return;
    }
    const url = this.config.wiseduServer + 'accept';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({ id: '' + mongoId, thirdParty, creatorCode: record.userCardnum }), { headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' } });
        if (res.data.state === 'success') {
          break;
        } else {
          this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
        }
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
  async hasten(mongoId) {
    // 故障催办
    this.ctx.logger.info('向东大服务台推送故障催办，故障单号：%s', mongoId);
    const record = await this.ctx.model.Trouble.findById(mongoId);
    const wiseduToken = await this.getToken();
    if (!record) {
      return;
    }
    const url = this.config.wiseduServer + 'hasten';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: '' + mongoId,
          thirdParty,
          creatorCode: record.userCardnum,
          creatorName: record.userName,
          creatorType: record.userCardnum[0],
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        if (res.data.state === 'success') {
          break;
        } else {
          this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
        }
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
  async accomplish(mongoId, staffName, staffCardnum) {
    // 故障等待验收
    this.ctx.logger.info('向东大服务台推送故障验收，故障单号：%s', mongoId);
    const record = await this.ctx.model.Trouble.findById(mongoId);
    const wiseduToken = await this.getToken();
    if (!record) {
      return;
    }
    const url = this.config.wiseduServer + 'accomplish';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: '' + mongoId,
          creatorName: staffName,
          creatorCode: staffCardnum,
          creatorType: staffCardnum[0],
          thirdParty,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        console.log({
          id: '' + mongoId,
          creatorName: staffName,
          creatorCode: staffCardnum,
          creatorType: staffCardnum[0],
          thirdParty,
        });
        if (res.data.state === 'success') {
          break;
        } else {
          this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
        }
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
  async confirm(mongoId, userName, userCardnum, userAssess, content) {
    // 故障办结
    this.ctx.logger.info('向东大服务台推送故障办结，故障单号：%s', mongoId);
    const record = await this.ctx.model.Trouble.findById(mongoId);
    const wiseduToken = await this.getToken();
    if (!record) {
      return;
    }
    const url = this.config.wiseduServer + 'confirm';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: '' + mongoId,
          creatorName: userName,
          creatorCode: userCardnum,
          creatorType: userCardnum[0],
          assess: '' + userAssess,
          content,
          thirdParty,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        if (res.data.state === 'success') {
          break;
        } else {
          this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
        }
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
  async transmit(mongoId, staffCardnum, staffName, adminCardnum, adminName) {
    // 故障转发
    this.ctx.logger.info('向东大服务台推送故障转发，故障单号：%s', mongoId);
    const record = await this.ctx.model.Trouble.findById(mongoId);
    const wiseduToken = await this.getToken();
    if (!record) {
      return;
    }
    const url = this.config.wiseduServer + 'transmit';
    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: '' + mongoId,
          acceptUserCodes: staffCardnum,
          acceptUserNames: staffName,
          acceptUserTypes: staffCardnum[0],
          isAdmin: '0',
          sortCode: name2Code[record.typeName],
          thirdParty,
          creatorCode: adminCardnum,
          creatorName: adminName,
          creatorType: adminCardnum[0],
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        console.log({
          id: '' + mongoId,
          acceptUserCodes: staffCardnum,
          acceptUserNames: staffName,
          acceptUserTypes: staffCardnum[0],
          content: '运维人员正在受理',
          isAdmin: '0',
          thirdParty,
          sortId: name2Code[record.typeName],
          creatorCode: adminCardnum,
          creatorName: adminName,
          creatorType: adminCardnum[0],
        });
        if (res.data.state === 'success') {
          break;
        } else {
          this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
        }
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
  async reply(mongoId, name, cardnum, content, replyId) {
    console.log('1.replyId:' + replyId);
    // 故障回复（留言消息回复？？）
    this.ctx.logger.info('向东大服务台推送故障留言消息，故障单号：%s', mongoId);
    const record = await this.ctx.model.Trouble.findById(mongoId);
    const wiseduToken = await this.getToken();
    if (!record) {
      return;
    }
    const url = this.config.wiseduServer + 'reply';
    console.log('2.replyId:' + replyId);
    let attempt = 0;
    while (attempt < 3) {
      console.log('3.replyId:' + replyId);
      try {
        console.log('4.replyId:' + replyId);
        this.ctx.logger.error('回复接口传参 : ' + qs.stringify({
          id: '' + mongoId,
          creatorName: name,
          creatorCode: cardnum,
          creatorType: cardnum[0],
          content,
          thirdParty,
          replyId: '' + replyId,
        }));
        const res = await axios.post(url, qs.stringify({
          id: '' + mongoId,
          creatorName: name,
          creatorCode: cardnum,
          creatorType: cardnum[0],
          content,
          thirdParty,
          replyId: '' + replyId,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        this.ctx.logger.error('回复接口返回值 : ' + JSON.stringify(res.data));
        if (res.data.state === 'success') {
          break;
        } else {
          this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
        }
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
  async reject(mongoId, userCardnum, userName, userContent, staffCardnum) {
    // 故障驳回
    this.ctx.logger.info('向东大服务台推送故障驳回，故障单号：%s', mongoId);
    const record = await this.ctx.model.Trouble.findById(mongoId);
    const recordOfStaff = await this.ctx.model.User.findOne({ cardnum: staffCardnum });
    const wiseduToken = await this.getToken();
    if (!record) {
      return;
    }
    if (!recordOfStaff) {
      return;
    }
    const url = this.config.wiseduServer + 'reject';
    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: '' + mongoId,
          creatorName: userName,
          creatorCode: userCardnum,
          creatorType: userCardnum[0],
          content: userContent,
          thirdParty,
          acceptUserCodes: recordOfStaff.name,
          acceptUserNames: recordOfStaff.cardnum,
          acceptUserTypes: recordOfStaff.cardnum[0],
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        console.log({
          id: '' + mongoId,
          creatorName: userName,
          creatorCode: userCardnum,
          creatorType: userCardnum[0],
          content: userContent,
          thirdParty,
        });
        if (res.data.state === 'success') {
          break;
        } else {
          this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, res.data.msg);
        }
      } catch (e) {
        this.ctx.logger.error('向东大服务台推送出现错误（故障单号：%s），重试，错误原因：%s', mongoId, e);
      }
      attempt++;
    }
  }
}

module.exports = WiseduService;
