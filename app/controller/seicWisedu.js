'use strict';

const Controller = require('egg').Controller;
const sha1 = require('sha1');
const moment = require('moment');
const uuid = require('uuid/v4');


class wiseduController extends Controller {
  async token() {
    const { ctx } = this;
    const { timestamp, signature } = ctx.query;
    let now = +moment();
    // 签名验证
    if (signature !== sha1(this.config.seicApiKey + timestamp + this.config.seicSecret)) {
      ctx.identityError('身份验证失败');
    }
    await ctx.model.WiseduTicket.deleteMany({});
    now = +moment();
    const newToken = new ctx.model.WiseduTicket({
      token: uuid(),
      expireTime: now + 7200 * 1000,
    });
    await newToken.save();
    return newToken.token;

  }
}

module.exports = wiseduController;
