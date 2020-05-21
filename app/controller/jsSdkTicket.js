'use strict';

const Controller = require('egg').Controller;

class JsSdkTicketController extends Controller {
  async index() {
    const { ctx } = this;
    let extraUrl = ctx.query.extraUrl;
    console.log(extraUrl);
    extraUrl = extraUrl ? decodeURIComponent(extraUrl) : null;
    return {
      debug: false,
      ...(await ctx.service.getAccessToken.jsSdkTicket(extraUrl)),
      appId: ctx.app.config.wechat.appID,
      jsApiList: [ 'chooseImage', 'previewImage', 'uploadImage', 'hideAllNonBaseMenuItem', 'hideOptionMenu' ],
    };
  }

}

module.exports = JsSdkTicketController;
