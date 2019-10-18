'use strict'
const Service = require('egg').Service
const axios = require('axios')

class replyMessageService extends Service {
    async reply(openid,content) {
        let accessToken = await this.ctx.service.getAccessToken.accessToken()
        let url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`
        let replyData={
            "touser":"OPENID",
    "msgtype":"text",
    "text":
    {
         "content":"Hello World"
    }
        }
        let res = await axios.get(url, {responseType: 'arraybuffer'})
        
    }
}

module.exports = replyMessageService;