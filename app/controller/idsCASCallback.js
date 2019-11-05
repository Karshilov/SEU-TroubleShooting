'use strict'
const Controller = require('egg').Controller
const sha1 = require('js-sha1')
const moment = require('moment');
const uuid = require('uuid/v4');
const axios = require('axios');
const xmlparser = require('fast-xml-parser');

class callbackController extends Controller {
  async callback() {
    // CAS认证
    const { ctx } = this
    try {
      let ids_session = ctx.params.idsSession
      let ticket = ctx.request.query.ticket
      //console.log(ticket)
      //console.log(ids_session)
      //let serviceValidateURL = `${this.ctx.app.config.casURL}/serviceValidate?service=${this.ctx.app.config.serverURL}idsCallback?idsSession=${ids_session}&ticket=${ticket}`

      //测试用
      let serviceValidateURL = `${ctx.app.config.casURL}authserver/serviceValidate?service=http://auth.myseu.cn/idsCallback/${ids_session}&ticket=${ticket}`

      let res = await axios.get(serviceValidateURL)
      //console.log(xmlparser.parse(res.data)['cas:serviceResponse']['cas:authenticationSuccess'])
      let data = xmlparser.parse(res.data)['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes']
      let idsList = await ctx.model.Ids.findOne({ idsSession: ids_session })
      let newPerson = new ctx.model.User({
        openid: idsList.idsSession,
        name: data['cas:cn'],
        cardnum: data['cas:uid'],
      })
      await newPerson.save()

    }catch(e){
      console.log(e)
      throw('统一身份认证又崩啦')
    }

    // 向用户推送redirectURL,
    // 只在wehcatOAuth发放token
    let redirectURL = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ctx.app.config.wechat.appID}&redirect_uri=${ctx.app.config.serverURL}wechatOauth&response_type=code&scope=snsapi_base&state=${idsList.target}#wechat_redirect`
    let content = `<a href="${redirectURL}">点击链接继续</a>`
    await ctx.service.replyMessage.reply(idsList.openId, content)

  }
}

module.exports = callbackController;