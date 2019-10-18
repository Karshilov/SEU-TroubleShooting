'use strict'
const Service = require('egg').Service
const axios = require('axios')

class replyMessageService extends Service {
    async reply(openid,content) {
        let accessToken = await this.ctx.service.getAccessToken.accessToken()
        let url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`
        let replyData={
            "touser":openid,
            "msgtype":"text",
            "text":
            {
                "content":content
            }
        }
        let res = await axios.post(url, replyData)
        console.log(res.data)
        
    }
}

module.exports = replyMessageService;