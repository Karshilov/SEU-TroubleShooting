'use strict';
const Controller = require('egg').Controller;
const axios = require('axios');
const xmlparser = require('fast-xml-parser');

class callbackController extends Controller {
  async callback() {
    // CAS认证
    const { ctx } = this;
    try {
      const ids_session = ctx.params.idsSession;
      const ticket = ctx.request.query.ticket;
      // console.log(ticket)
      // console.log(ids_session)
      const serviceValidateURL = `${this.ctx.app.config.casURL}authserver/serviceValidate?service=${this.ctx.app.config.serverURL}idsCallback/${ids_session}&ticket=${ticket}`;

      // 测试用
      // let serviceValidateURL = `${ctx.app.config.casURL}authserver/serviceValidate?service=https://seicwxbz.seu.edu.cn/idsCallback/${ids_session}&ticket=${ticket}`

      const res = await axios.get(serviceValidateURL);
      console.log(xmlparser.parse(res.data)['cas:serviceResponse']);
      const data = xmlparser.parse(res.data)['cas:serviceResponse']['cas:authenticationSuccess']['cas:attributes'];
      const idsRecord = await ctx.model.Ids.findOne({ idsSession: ids_session });
      // 此处应该先查找是否有记录，如果有记录应该更新记录而不是创建新的
      let newPerson = await ctx.model.User.findOne({ openid: idsRecord.openId });
      if (!newPerson) {
        newPerson = new ctx.model.User({
          openid: idsRecord.openId,
          name: data['cas:cn'],
          cardnum: data['cas:uid'],
        });
      }
      await newPerson.save();
      // 向用户推送redirectURL,
      // 只在wehcatOAuth发放token
      console.log('继续跳转wechatOAuth');
      const redirectURL = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ctx.app.config.wechat.appID}&redirect_uri=${ctx.app.config.serverURL}wechatOauth&response_type=code&scope=snsapi_base&state=${idsRecord.target}#wechat_redirect`;
      ctx.redirect(redirectURL);
    } catch (e) {
      console.log(e);
      throw ('统一身份认证又崩啦');
    }


  }
}

module.exports = callbackController;
