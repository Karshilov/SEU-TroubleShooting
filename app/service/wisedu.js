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
  其他报障: '900',
};

const thirdParty = '3';

class WiseduService extends Service {
  async getToken() {
    let now = +moment(); // 当前时间
    const record = await this.ctx.model.WiseduToken.findOne({});
    if (record && record.expiresTime > now) {
      console.log('使用缓存的wisedu_access_token');
      return record.token;
    }
    await this.ctx.model.WiseduToken.deleteMany({});
    console.log('重新请求wisedu_access_token');
    const url = `https://coca.wisedu.com/common-app/token?apiKey=${this.config.wiseduApiKey}&secret=${this.config.wiseduSecret}`;
    let result = await axios.get(url);
    console.log('获取 token：', result.data);
    result = result.data;
    now = +moment();
    const newToken = new this.ctx.model.WiseduToken({
      token: result.data.apiToken,
      expiresTime: now + result.data.expiresIn * 1000,
    });
    await newToken.save();
    return result.data.apiToken;
  }

  async submit(mongoId, desc, typeName, userName, userCardnum, createdTime, imageUrl = null, phonenum, address) {
    // 故障提交
    console.log('对接东大服务台：开始推送');
    const url = this.config.wiseduServer + 'submit';
    console.log('获取token');
    const wiseduToken = await this.getToken();
    console.log(wiseduToken);
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
          createrCode: userCardnum,
          reporterMobile: phonenum,
          address,
          reporterType: userCardnum[0],
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        console.log(res);
        console.log('submit：', res.data);
        if (res.data.state === 'success') {
          return res.data; // 金智服务台的报障id
        }
        console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
  // 之后传入的 id 全是 mongoDB ObjectId
  async accept(id) {
    // 故障受理
    const record = await this.ctx.model.Trouble.findById(id);
    const wiseduToken = await this.getToken();
    if (!record || !record.wiseduId) {
      return;
    }
    const url = this.config.wiseduServer + 'accept';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({ id: record.wiseduId, thirdParty, createrCode: record.userCardnum }), { headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' } });
        if (res.data.state === 'success') {
          break;
        } else {
          console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
        }
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
  async hasten(id) {
    // 故障催办
    const record = await this.ctx.model.Trouble.findById(id);
    const wiseduToken = await this.getToken();
    if (!record || !record.wiseduId) {
      return;
    }
    const url = this.config.wiseduServer + 'hasten';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: record.wiseduId,
          thirdParty,
          createrCode: record.userCardnum,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        if (res.data.state === 'success') {
          break;
        } else {
          console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
        }
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
  async accomplish(id, staffName, staffCardnum) {
    // 故障等待验收
    const record = await this.ctx.model.Trouble.findById(id);
    const wiseduToken = await this.getToken();
    if (!record || !record.wiseduId) {
      return;
    }
    const url = this.config.wiseduServer + 'accomplish';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: record.wiseduId,
          createrName: staffName,
          createrCode: staffCardnum,
          thirdParty,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        if (res.data.state === 'success') {
          break;
        } else {
          console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
        }
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
  async confirm(id, userName, userCardnum, userAssess) {
    // 故障办结
    const record = await this.ctx.model.Trouble.findById(id);
    const wiseduToken = await this.getToken();
    if (!record || !record.wiseduId) {
      return;
    }
    const url = this.config.wiseduServer + 'confirm';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: record.wiseduId,
          createrName: userName,
          createrCode: userCardnum,
          Assess: '' + userAssess,
          thirdParty,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        if (res.data.state === 'success') {
          break;
        } else {
          console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
        }
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
  async transmit(id, staffCardnum, isAdmin) {
    // 故障转发
    const record = await this.ctx.model.Trouble.findById(id);
    const wiseduToken = await this.getToken();
    if (!record || !record.wiseduId) {
      return;
    }
    const url = this.config.wiseduServer + 'transmit';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: record.wiseduId,
          acceptUserCodes: staffCardnum,
          isAdmin,
          thirdParty,
          createrCode: record.userCardnum,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        if (res.data.state === 'success') {
          break;
        } else {
          console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
        }
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
  async reply(id, name, cardnum, content) {
    // 故障回复（留言消息回复？？）
    console.log('开始调试消息回复');
    const record = await this.ctx.model.Trouble.findById(id);
    console.log(record);
    const wiseduToken = await this.getToken();
    if (!record || !record.wiseduId) {
      return;
    }
    const url = this.config.wiseduServer + 'reply';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: record.wiseduId,
          createrName: name,
          createrCode: cardnum,
          content,
          thirdParty,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        console.log('======回复推送======');
        console.log(res);
        if (res.data.state === 'success') {
          break;
        } else {
          console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
        }
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
  async reject(id, userName, userCardnum, userContent) {
    // 故障驳回
    const record = await this.ctx.model.Trouble.findById(id);
    const wiseduToken = await this.getToken();
    if (!record || !record.wiseduId) {
      return;
    }
    const url = this.config.wiseduServer + 'reply';

    let attempt = 0;
    while (attempt < 3) {
      try {
        const res = await axios.post(url, qs.stringify({
          id: record.wiseduId,
          createrName: userName,
          createrCode: userCardnum,
          Content: userContent,
          thirdParty,
        }), {
          headers: { 'x-api-token': wiseduToken, 'content-type': 'application/x-www-form-urlencoded' },
        });
        if (res.data.state === 'success') {
          break;
        } else {
          console.log('向东大服务台推送出现错误，重试，错误原因：', res.data.msg);
        }
      } catch (e) {
        console.log('向东大服务台推送出现错误，重试，错误原因：', e);
      }
      attempt++;
    }
  }
}

module.exports = WiseduService;
