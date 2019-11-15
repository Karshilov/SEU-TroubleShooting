'use strict';
const Service = require('egg').Service;
const axios = require('axios');

class replyMessageService extends Service {
  async reply(openid, content) {
    const accessToken = await this.ctx.service.getAccessToken.accessToken();
    const url = `https://api.weixin.qq.com/cgi-bin/message/custom/send?access_token=${accessToken}`;
    const replyData = {
      touser: openid,
      msgtype: 'text',
      text:
            {
              content,
            },
    };
    await axios.post(url, replyData);
    // console.log(res.data);
  }
}

module.exports = replyMessageService;
