'use strict';

const Controller = require('egg').Controller;
const sha1 = require('sha1');
const moment = require('moment');
const sprintf = require('sprintf-js').sprintf;

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
        const { ctx } = this;

        // let access_token = await ctx.service.getAccessToken.accessToken();
        // let url = sprintf('https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=%s', access_token);
        // let result = await ctx.curl(url, {
        //     method: 'POST',
        //     contentType: 'json',
        //     data: {
        //         "touser": ctx.request.query.openid,
        //         "msgtype": "text",
        //         "text":
        //         {
        //             "content": "<a href='https://myseu.cn' data-miniprogram-appid='wxaef6d2413690047f' data-miniprogram-path='pages/idsAuth?APPID=<APPID>&IDS_SESSION=<IDS_SESSION>&FORCE=<FORCE>'>统一身份认证登录</a>"
        //         }

        //     },
        //     dataType: 'json',
        // })
        // console.log(result);

        // 被动回复消息
        // console.log(ctx.request.body);
        // ctx.response.type = 'application/xml';
        // ctx.response.body =
        // `
        // <xml>
        //     <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
        //     <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
        //     <CreateTime>${moment().unix()}</CreateTime>
        //     <MsgType><![CDATA[text]]></MsgType>
        //     <Content><![CDATA[<a href="http://www.qq.com" data-miniprogram-appid="wxaef6d2413690047f" data-miniprogram-path="pages/index/index">点击跳小程序</a>]]></Content>
        // </xml>
        // `
    }
}

module.exports = wechatController;