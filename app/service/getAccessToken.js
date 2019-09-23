'use strict'
const Service = require('egg').Service
const moment = require('moment')
const uuid = require('uuid/v4')
const sha1 = require('sha1')

// 微信的时间戳都是用秒的所以这里的时间戳都用秒

class accessTokenService extends Service {
    async accessToken() {
        let nowTime = moment().unix();  //当前时间
        //console.log(nowTime);
        let res = await this.ctx.model.Token.find({ startTime: { $lt: nowTime }, stopTime: { $gt: nowTime } },['accessToken'],{sort:{stopTime:-1},limit:1});
        if (res.length) {
            console.log('使用缓存的access_token');
            return res[0].accessToken;
        } else {
            console.log('重新请求access_token');
            let url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.config.wechat.appID}&secret=${this.config.wechat.appsecret}`;
            let result = await this.ctx.curl(url, {
                dataType: 'json'
            })
            let now = moment().unix();
            let newToken = this.ctx.model.Token({
                accessToken: result.data.access_token,
                expiresIn: result.data.expires_in,
                startTime: now,
                stopTime: now + result.data.expires_in
            })
            await newToken.save();
            return result.data.access_token;
        }
    }

    async jsApiTicket() {
        let nowTime = moment().unix();  //当前时间
        let accessToken = await this.accessToken()
        let record = await this.ctx.model.JsapiTicket.find({expiresTime:{$gt:nowTime}},['jsApiTicket'],{sort:{expiresTime:-1},limit:1});
        if(record.length){
            // 缓存有效，直接使用
            return record[0].jsApiTicket
        } else {
            // 请求新的
            let url = `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`;
            let result = await this.ctx.curl(url, {
                dataType: 'json'
            })
            if(!result.data.errcode){
                let newTicket = new this.ctx.model.JsapiTicket({
                    jsApiTicket:result.data.ticket,
                    expiresTime:nowTime+result.data.expires_in
                })
                await newTicket.save()
                return result.data.ticket
            } else {
                console.log(result.data)
            }
        }
    }

    async jsSdkTicket(){
        let ticket = await this.jsApiTicket()
        console.log(ticket)
        let noncestr = uuid().split('-').join('')
        console.log(noncestr)
        let timestamp = moment().unix()
        console.log(timestamp)
        let string1 = `jsapi_ticket=${ticket}&noncestr=${noncestr}&timestamp=${timestamp}&url=${this.config.redirectURL}/`
        console.log(this.config.redirectURL)
        console.log(string1)
        let signature = sha1(string1)
        return {nonceStr:noncestr, timestamp, signature}
    }
}

module.exports = accessTokenService;