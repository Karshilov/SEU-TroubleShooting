'use strict';

const Controller = require('egg').Controller;
const moment = require('moment');
const uuid = require('uuid/v4');
const yaml = require('yaml')
const fs = require('fs')
const path = require('path')

class loginController extends Controller {
  async index() {
    const { ctx } = this;
    let code = ctx.request.query.code;
    let state = ctx.request.query.state;
    let url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.config.wechat.appID}&secret=${this.config.wechat.appsecret}&code=${code}&grant_type=authorization_code` ;
    let result = await this.ctx.curl(url, {
      dataType: 'json'
    })

    let person = await this.ctx.model.User.find({ openid: result.data.openid });
    let token;
    if (person.length === 0) {
      token = uuid(result.data.openid);
      let newPerson = this.ctx.model.User({
        cardnum: '',
        indentityType: '',
        Institute: '',
        name: '',
        openid: result.data.openid,
        token: token,
        tokenExpireTime: 7200,
        tokenGetTime: moment().unix(),
        phonenum: ''
      });
      try {
        await newPerson.save();
      } catch (err) {
        console.log("添加新的访问用户失败");
        console.log(err);
      }
    }
    else {
      token = person[0].token
    }

    
    //用户存在isnewbi为0,否则为1
    let redirectURL = this.config.redirectURL + `/#/state?token=${token}&isnewbi=${person.length ? 0 : 1}`;
    console.log(redirectURL)
    //重定向到前端接口
    ctx.redirect(redirectURL);

  }
}

module.exports = loginController;