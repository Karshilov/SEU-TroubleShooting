'use strict';
const Service = require('egg').Service;
const moment = require('moment');
const axios = require('axios');
const name2Code = {
  四牌楼网络报障: 101,
  九龙湖网络报障: 102,
  丁家桥网络报障: 103,
  宿舍区网络报障: 104,
  信息系统报障: 201,
  网站报障: 211,
  其他报障: 900,
};

class WiseduService extends Service {
  async getToken() {
    let now = moment().unix(); // 当前时间
    const record = await this.ctx.model.WiseduToken.findOne({});
    if (record && record.expireTime > now) {
      console.log('使用缓存的wisedu_access_token');
      return record.token;
    }
    await this.ctx.model.WiseduToken.deleteMany({});
    console.log('重新请求wisedu_access_token');
    const url = `https://coca.wisedu.com/common-app/token?apiKey=${this.config.wiseduApiKey}&secret=${this.config.wiseduSecret}`;
    const result = await axios.get(url);
    now = moment().unix();
    const newToken = new this.ctx.model.WiseduToken({
      token: result.data.apiToken,
      expireTime: now + result.data.expiresIn * 1000,
    });
    await newToken.save();
    return result.data.apiToken;
  }
  async submit(mongoId, TypeName, desc, typeName, userName, userCardnum, imageUrl, createdTime) {
    // 故障提交
    const url = this.config.wiseduServer + 'submit';
    const result = await axios.post(url, {
      id: mongoId,
      title: TypeName,
      summary: desc,
      sortId: name2Code[typeName],
      level: 1,
      source: 1,
      reporter: userName,
      reporterCode: userCardnum,
      reportTime: createdTime,
      file: imageUrl,
    });
    if (result.state === 'failure' || result.state === 'error') {
      this.ctx.error(1, '故障提交失败');
    }
    return result.data; // 金智服务台的报障id

  }
  async accept(id) {
    // 故障受理
    const url = this.config.wiseduServer + 'accept';
    const result = await axios.post(url, {

    })
  }
  async hasten(mongoId) {
    // 故障催办
    const url = this.config.wiseduServer + 'hasten';
    const result = await axios.post(url, {
      id: mongoId,
    })
    if (result.state === 'failure' || result.state === 'error') {
      this.ctx.error(1, '故障催办失败');
    }
    return result.data; // 金智服务台的报障id
  }
  async accomplish(mongoId, userName, userCardnum) {
    // 故障等待验收
    const url = this.config.wiseduServer + 'accomplish';
    const result = await axios.post(url, {
      id: mongoId,
      createrName: userName,
      createrCode: userCardnum,
    })
    if (result.state === 'failure' || result.state === 'error'){
      this.ctx.error(1, '故障待验收申请失败')
    }
    return result.data; // 金智服务台的报障id
  }
  async confirm(mongoId, userName, userCardnum, userAssess) {
    // 故障办结
    const url = this.config.wiseduServer + 'confirm';
    const result = await axios.post(url, {
      id: mongoId,
      createrName: userName,
      createrCode: userCardnum,
      Assess: userAssess,
    })
    if (result.state === 'failure' || result.state === 'error'){
      this.ctx.error(1, '故障办结失败')
    }
    return result.data; // 金智服务台的报障id
  }
  async transmit(mongoId, userCardnum, userIsAdmin){
    // 故障转发
    const url = this.config.wiseduServer + 'transmit';
    const result = await axios.post(url, {
      id: mongoId,
      acceptUserCodes: userCardnum,
      isAdmin: userIsAdmin,
    })
    if (result.state === 'failure' || result.state === 'error'){
      this.ctx.error(1, '故障转发失败')
    }
    return result.data; // 金智服务台的报障id
  }
  async reply(mongoId, userName, userCardnum, userContent){
    // 故障回复
    const url = this.config.wiseduServer + 'reply';
    const result = await axios.post(url, {
      id: mongoId,
      createrName: userName,
      createrCode: userCardnum,
      Content: userContent,
    })
    if (result.state === 'failure' || result.state === 'error'){
      this.ctx.error(1, '故障回复失败')
    }
    return result.data; // 金智服务台的报障id
  }
  async reject(mongoId, userName, userCardnum, userContent){
        // 故障驳回
        const url = this.config.wiseduServer + 'reply';
        const result = await axios.post(url, {
          id: mongoId,
          createrName: userName,
          createrCode: userCardnum,
          Content: userContent,
        })
        if (result.state === 'failure' || result.state === 'error'){
          this.ctx.error(1, '故障驳回失败')
        }
        return result.data; // 金智服务台的报障id
  }
}

module.exports = WiseduService;
