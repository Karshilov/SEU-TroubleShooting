'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const uuid = require('uuid/v4');
const md5 = require('js-md5');


class loginController extends Controller {
  async index() {

    const { ctx } = this;
    const code = ctx.request.query.code;
    let state = ctx.request.query.state;
    const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.config.wechat.appID}&secret=${this.config.wechat.appsecret}&code=${code}&grant_type=authorization_code`;
    const result = await this.ctx.curl(url, {
      dataType: 'json',
    });
    if (!result || !result.data || !result.data.openid) {
      ctx.permissionError('微信认证出现错误，请重试');
    }
    const person = await this.ctx.model.User.findOne({ openid: result.data.openid });

    const token = uuid();
    let casURL = '';
    // console.log(person);
    // console.log('!person || (!person.cardnum && !person.name):', !person || (!person.cardnum && !person.name));
    if (!person || (!person.cardnum && !person.name)) {
      // 用户信息不存在，跳转到学校的ids认证，获取用户的信息
      const idsSession = token;
      const newIds = new ctx.model.Ids({
        idsSession,
        openId: result.data.openid,
        target: state,
      });
      await newIds.save();
      const serviceURL = `${this.ctx.app.config.serverURL}idsCallback/${idsSession}`;
      casURL = `${this.ctx.app.config.casLoginURL}?goto=${serviceURL}`;
    } else {
      person.token = token;
      person.tokenExpireTime = +moment() + 30 * 60 * 1000;
      await person.save();
    }


    if (state === 'debug') {
      ctx.body = token;
      return;
    }

    state = state.split('_');
    // 用户存在isNewbie为0,否则为1
    let redirectURL;
    if (casURL === '') {
      if (this.config.exportOAuth[state[0]] && this.config.exportOAuth[state[0]].urlMap[state[1]]) {
        // 和外部对接
        const signature = md5(`uid=${person.cardnum}&name=${encodeURIComponent(person.name)}&secretKey=${this.config.exportOAuth[state[0]].secretKey}`);
        redirectURL = `${this.config.exportOAuth[state[0]].urlMap[state[1]]}?uid=${person.cardnum}&name=${encodeURIComponent(person.name)}&signature=${signature}`;
      } else if (person.phonenum && person.address) {
        redirectURL = this.config.redirectURL + `#/${state[0]}/${token}${state[1] ? '/' + state[1] : ''}`;
      } else {
        redirectURL = this.config.redirectURL + `#/userbind/${token}/${state[0]}${state[1] ? '/' + state[1] : ''}`;
      }
    } else {
      redirectURL = casURL;
    }
    // 重定向到前端接口
    console.log('重定向' + redirectURL);
    ctx.redirect(redirectURL);
  }
}

module.exports = loginController;
