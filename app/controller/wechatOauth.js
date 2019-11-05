'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const uuid = require('uuid/v4');


class loginController extends Controller {
  async index() {

    const { ctx } = this;
    let code = ctx.request.query.code;
    let state = ctx.request.query.state;
    let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.config.wechat.appID}&secret=${this.config.wechat.appsecret}&code=${code}&grant_type=authorization_code`;
    let result = await this.ctx.curl(url, {
      dataType: 'json'
    })
    if (!result || !result.data || !result.data.openid) {
      ctx.permissionError('微信认证出现错误，请重试')
    }
    let person = await this.ctx.model.User.findOne({ openid: result.data.openid });
  
    let token = uuid();
    if (!person) {
      let newPerson = this.ctx.model.User({
        openid: result.data.openid,
        token: token,
        tokenExpireTime: +moment() + 30 * 60 * 1000
      });
      let res = await newPerson.save();

    } else {
      person.token = token;
      person.tokenExpireTime = +moment() + 30 * 60 * 1000;
      await person.save();
    }


    if (state === 'debug') {
      ctx.body = token;
      return
    }

    state = state.split('_')
    //用户存在isNewbie为0,否则为1
    let redirectURL
    
    if (person.phonenum && person.address) {
      redirectURL = this.config.redirectURL + `#/${state[0]}/${token}${state[1] ? '/' + state[1] : ''}`
    } else {
      redirectURL = this.config.redirectURL + `#/userbind/${token}/${state[0]}${state[1] ? '/' + state[1] : ''}`
    }
    //重定向到前端接口
    console.log(redirectURL)
    ctx.redirect(redirectURL);

  }
}

module.exports = loginController;