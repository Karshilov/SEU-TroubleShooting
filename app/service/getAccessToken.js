'use strict'
const Service = require('egg').Service
const moment = require('moment')
const sprintf = require('sprintf-js').sprintf

class accessTokenService extends Service {
    async accessToken() {
        let nowTime = moment().unix();  //当前时间
        //console.log(nowTime);
        let res = await this.ctx.model.Token.find({ startTime: { $lt: nowTime }, stopTime: { $gt: nowTime } });
        if (res.length) {
            console.log('使用缓存的access_token');
            return res[0].accessToken;
        } else {
            console.log('重新请求access_token');
            let url = sprintf('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s', this.config.wechat.appID, this.config.wechat.appsecret);
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
}

module.exports = accessTokenService;