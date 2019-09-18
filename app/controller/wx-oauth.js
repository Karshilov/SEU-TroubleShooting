'use strict';

const Controller = require('egg').Controller;
const sprintf = require('sprintf-js').sprintf;
const moment = require('moment');
const uuid = require('uuid/v4');
const yaml = require('yaml')
const fs = require('fs')
const path = require('path')

class loginController extends Controller {
  async index(app) {
    const { ctx } = this;
    let code = ctx.request.query.code;
    let state = ctx.request.query.state;
    let url = sprintf('https://api.weixin.qq.com/sns/oauth2/access_token?appid=%s&secret=%s&code=%s&grant_type=authorization_code', this.config.wechat.appID, this.config.wechat.appsecret, code);
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

    let configYaml = yaml.parse(fs.readFileSync('/Users/zhaozhengji/SEU-TroubleShooting/SEU-TroubleShooting.yml', 'utf8'));
    //用户存在isnewbi为1,否则为0
    let redirectURL = sprintf(configYaml.redirectURL + '/#/state?token=%s&isnewbi=%s', token, person.length ? 1 : 0);
    console.log(redirectURL);
    //重定向到前端接口
    ctx.redirect(redirectURL);

  }
}

module.exports = loginController;