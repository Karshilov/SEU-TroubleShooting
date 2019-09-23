'use strict';

const Controller = require('egg').Controller;

class JsSdkTicketController extends Controller {
  async index() {
    const { ctx } = this;
    return {
        debug:true,
        ...(await ctx.service.getAccessToken.jsSdkTicket()),
        appId:ctx.app.config.wechat.appID,
        jsApiList: ['chooseImage','previewImage','uploadImage']
    }
    
  }
}

module.exports = JsSdkTicketController;