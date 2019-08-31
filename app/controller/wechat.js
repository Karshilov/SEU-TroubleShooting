'use strict';

const Controller = require('egg').Controller;
const sha1 = require('sha1');

class wechatController extends Controller {
    async checkSignature() {
        
        let signature = this.ctx.request.query.signature;
        let echostr = this.ctx.request.query.echostr;
        let timestamp = this.ctx.request.query.timestamp;
        let nonce = this.ctx.request.query.nonce;
        let token = this.config.wechat.token;
        let array = [token, nonce, timestamp].sort();

        if (signature === sha1(array[0] + array[1] + array[2])){
            this.ctx.response.body = echostr;
        } 
        else{
            this.ctx.response.body = 'qnmd';
        }

    }
}

module.exports = wechatController;