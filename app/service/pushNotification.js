'use strict';
const Service = require('egg').Service;
const moment = require('moment');

class pushNotification extends Service {
  async userNotification(cardnum, title, address, type, status, lastModifiedTime, remark, url) {
    const access_token = await this.service.getAccessToken.accessToken();
    const user = await this.ctx.model.User.findOne({ cardnum });
    if (!user) {
      return;
    }
    const postJson = {
      touser: user.openid,
      template_id: this.config.wechat.userTemplateId,
      url,
      data: {
        first: {
          value: title,
          color: '#173177',
        },
        keyword1: {
          value: address,
          color: '#173177',
        },
        keyword2: {
          value: type,
          color: '#173177',
        },
        keyword3: {
          value: status,
          color: '#173177',
        },
        keyword4: {
          value: lastModifiedTime,
          color: '#173177',
        },
        remark: {
          value: remark,
          color: '#173177',
        },
      },
    };
    const notificationURL = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`;
    const result = await this.ctx.curl(notificationURL, {
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify(postJson),
    });

    if (result.data.errcode) {
      console.log(`故障单处理进度通知发送失败 错误码：${result.data.errcode}`);
    }


  }

  async staffNotification(cardnum, title, code, type, desc, phonenum, createdTime, remark, url) {
    const access_token = await this.service.getAccessToken.accessToken();
    const user = await this.ctx.model.User.findOne({ cardnum });
    const nowHour = moment().hour();
    if (!user) {
      return;
    }
    if (nowHour > 22 || nowHour < 6) {
      // 晚上10点到第二天六点不推送故障报修通知
      console.log('非工作时间，暂不推送故障报修通知');
      return;
    }
    const postJson = {
      touser: user.openid,
      template_id: this.config.wechat.staffTemplateId,
      url,
      data: {
        first: {
          value: title,
          color: '#173177',
        },
        keyword1: {
          value: code,
          color: '#173177',
        },
        keyword2: {
          value: type,
          color: '#173177',
        },
        keyword3: {
          value: desc,
          color: '#173177',
        },
        keyword4: {
          value: createdTime,
          color: '#173177',
        },
        remark: {
          value: remark,
          color: '#173177',
        },
      },
    };
    const notificationURL = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`;
    const result = await this.ctx.curl(notificationURL, {
      method: 'POST',
      dataType: 'json',
      data: JSON.stringify(postJson),
    });

    if (result.data.errcode) {
      console.log(`故障报修通知发送失败 错误码：${result.data.errcode}`);

    }

  }
}

module.exports = pushNotification;
