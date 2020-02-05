'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const uuid = require('uuid/v4');
const axios = require('axios');


class casWeCanController extends Controller {
  async login() {
    const { ctx } = this;
    const { state } = ctx.request.query;
    const service = 'https://seicwxbz.seu.edu.cn/api/cas-we-can/callback';
    const casWeCanUrl = `https://seicwxbz.seu.edu.cn/cas-we-can/login?goto=${encodeURIComponent(`${service}?state=${state}`)}`;
    ctx.logger.debug('重定向：%s', casWeCanUrl);
    ctx.redirect(casWeCanUrl);
  }

  async callback() {
    const { ctx } = this;
    const { ticket } = ctx.request.query;
    let state = ctx.request.query.state;
    const service = 'https://seicwxbz.seu.edu.cn/api/cas-we-can/callback';
    // 从 CAS-We-Can 获取用户信息
    let casWeRes;
    try {
      casWeRes = await axios.get(`https://seicwxbz.seu.edu.cn/cas-we-can/serviceValidate?ticket=${ticket}&service=${service}`);
    } catch (e) {
      // 如果出现错误则发起重试
      const retryUrl = `https://seicwxbz.seu.edu.cn/cas-we-can/login?goto=${encodeURIComponent(`${service}?state=${state}`)}`;
      ctx.logger.error(e);
      ctx.logger.debug('访问 casWeCan 服务出现错误，发起重试，重定向：%s', retryUrl);
      ctx.redirect(retryUrl);
    }
    casWeRes = casWeRes.data;

    let person = await ctx.model.User.findOne({ openid: casWeRes.openid });
    if (!person) {
      person = new ctx.model.User({
        openid: casWeRes.openid,
        name: casWeRes.cas_info.name,
        cardnum: casWeRes.cas_info.cardnum,
      });
    } else {
      person.name = casWeRes.cas_info.name;
      person.cardnum = casWeRes.cas_info.cardnum;
    }
    await person.save();

    // 生成 token
    const token = uuid();
    person.token = token;
    person.tokenExpireTime = +moment() + 30 * 60 * 1000;
    await person.save();

    if (state === 'debug') {
      ctx.body = token;
      return;
    }

    state = state.split('_');
    let redirectURL;
    if (person.phonenum && person.address) {
      redirectURL = this.config.redirectURL + `#/${state[0]}/${token}${state[1] ? '/' + state[1] : ''}`;
    } else {
      redirectURL = this.config.redirectURL + `#/userbind/${token}/${state[0]}${state[1] ? '/' + state[1] : ''}`;
    }

    // 重定向到前端接口
    ctx.logger.debug('重定向：%s', redirectURL);
    ctx.redirect(redirectURL);
  }
}

module.exports = casWeCanController;
