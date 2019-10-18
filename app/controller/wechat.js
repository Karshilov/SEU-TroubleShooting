'use strict';

const Controller = require('egg').Controller;
const sha1 = require('sha1');
const moment = require('moment');


class wechatController extends Controller {
    async checkSignature() {

        let signature = this.ctx.request.query.signature;
        let echostr = this.ctx.request.query.echostr;
        let timestamp = this.ctx.request.query.timestamp;
        let nonce = this.ctx.request.query.nonce;
        let token = this.config.wechat.token;
        let array = [token, nonce, timestamp].sort();

        if (signature === sha1(array[0] + array[1] + array[2])) {
            this.ctx.response.body = echostr;
        }
        else {
            this.ctx.response.body = 'qnmd';
        }

    }

    async post() {
        // 处理微信服务器推送消息
        let signature = this.ctx.request.query.signature;
        let timestamp = this.ctx.request.query.timestamp;
        let nonce = this.ctx.request.query.nonce;
        let token = this.config.wechat.token;
        let array = [token, nonce, timestamp].sort();

        if (signature === sha1(array[0] + array[1] + array[2])) {
            /**
             * TODO 对接统一身份认证
             * 判断事件类型
             * 如果是 CLICK 事件 - ？
             * 如果是 KEYWORD 事件
             */
            await this.ctx.service.keywords.process(this.ctx)
        }
        else {
            this.ctx.response.body = 'qnmd';
        }
    }
}

module.exports = wechatController;