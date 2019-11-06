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
      let serviceValidateURL = `${this.ctx.app.config.casURL}authserver/serviceValidate?service=${this.ctx.app.config.serverURL}idsCallback?idsSession=${ids_session}&ticket=${ticket}`

      //测试用
      //let serviceValidateURL = `${ctx.app.config.casURL}authserver/serviceValidate?service=https://seicwxbz.seu.edu.cn/idsCallback/${ids_session}&ticket=${ticket}`

      let res = await axios.get(serviceValidateURL)
      console.log(xmlparser.parse(res.data)['cas:serviceResponse'])
      let data = xmlparser.parse(res.data)['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes']
      let idsList = await ctx.model.Ids.findOne({ idsSession: ids_session })
      let newPerson = new ctx.model.User({
        openid: idsList.idsSession,
        
        //假的
        name:'qnmd产品经理',

        //name: data['cas:cn'],
        cardnum: data['cas:uid'],
      })
      await newPerson.save()

      // 向用户推送redirectURL,
      // 只在wehcatOAuth发放token
      console.log('继续跳转wechatOAuth')
      let redirectURL = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ctx.app.config.wechat.appID}&redirect_uri=${ctx.app.config.serverURL}wechatOauth&response_type=code&scope=snsapi_base&state=${idsList.target}#wechat_redirect`
      ctx.redirect(redirectURL)


    } catch (e) {
      console.log(e)
      throw ('统一身份认证又崩啦')
    }




  }
}

module.exports = callbackController;