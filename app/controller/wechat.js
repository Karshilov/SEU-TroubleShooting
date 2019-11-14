'use strict';

const Controller = require('egg').Controller;
const sha1 = require('sha1');
// const moment = require('moment');


class wechatController extends Controller {
  async checkSignature() {

    const signature = this.ctx.request.query.signature;
    const echostr = this.ctx.request.query.echostr;
    const timestamp = this.ctx.request.query.timestamp;
    const nonce = this.ctx.request.query.nonce;
    const token = this.config.wechat.token;
    const array = [ token, nonce, timestamp ].sort();

    if (signature === sha1(array[0] + array[1] + array[2])) {
      this.ctx.response.body = echostr;
    } else {
      this.ctx.response.body = 'qnmd';
    }

  }

  async post() {
    // 处理微信服务器推送消息
    const signature = this.ctx.request.query.signature;
    const timestamp = this.ctx.request.query.timestamp;
    const nonce = this.ctx.request.query.nonce;
    const token = this.config.wechat.token;
    const array = [ token, nonce, timestamp ].sort();

    if (signature === sha1(array[0] + array[1] + array[2])) {
      /**
             * 对接统一身份认证
             * 判断事件类型
             * 如果是 CLICK 事件 - ？
             * 如果是 KEYWORD 事件
             */
      await this.ctx.service.wechatAction.process(this.ctx);
    } else {
      this.ctx.response.body = 'qnmd';
    }
  }
}

module.exports = wechatController;
