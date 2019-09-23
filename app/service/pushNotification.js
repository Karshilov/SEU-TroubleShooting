'use strict'
const Service = require('egg').Service
const moment = require('moment')

class pushNotification extends Service {
    async userNotification(cardnum, title, address, type, status, lastModifiedTime, remark, url) {
        let access_token = await this.service.getAccessToken.accessToken();
        let user = await this.ctx.model.User.findOne({ cardnum });
        if (!user) {
            return
        }
        let postJson = {
            "touser": user.openid,
            "template_id": this.config.wechat.userTemplateId,
            "url": url,
            "data": {
                "first": {
                    "value": title+'\n',
                    "color": "#173177"
                },
                "keyword1": {
                    "value": address+'\r',
                    "color": "#173177"
                },
                "keyword2": {
                    "value": type+'\r',
                    "color": "#173177"
                },
                "keyword3": {
                    "value": status+'\r',
                    "color": "#173177"
                },
                "keyword4": {
                    "value": lastModifiedTime+'\r',
                    "color": "#173177"
                },
                "remark": {
                    "value": '\n'+remark+'\n',
                    "color": "#173177"
                }
            }
        }
        let notificationURL = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`;
        let result = await this.ctx.curl(notificationURL, {
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(postJson)
        })
        
        if(result.data.errcode){
            console.log('故障单处理进度通知发送失败')
        }


    }

    async staffNotification(cardnum, title, code, type, desc, phonenum, createdTime, remark, url) {
        let access_token = await this.service.getAccessToken.accessToken();
        let user = await this.ctx.model.User.findOne({ cardnum });
        if (!user) {
            return
        }
        let postJson = {
            "touser": user.openid,
            "template_id": this.config.wechat.staffTemplateId,
            "url": url,
            "data": {
                "first": {
                    "value": title+'\n',
                    "color": "#173177"
                },
                "keyword1": {
                    "value": code+'\r',
                    "color": "#173177"
                },
                "keyword2": {
                    "value": type+'\r',
                    "color": "#173177"
                },
                "keyword3": {
                    "value": desc+'\r',
                    "color": "#173177"
                },
                "keyword4": {
                    "value": phonenum+'\r',
                    "color": "#173177"
                },
                "keyword5": {
                    "value": createdTime+'\r',
                    "color": "#173177"
                },
                "remark": {
                    "value": '\n'+remark+'\n',
                    "color": "#173177"
                }
            }
        }
        let notificationURL = `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`;
        let result = await this.ctx.curl(notificationURL, {
            method: 'POST',
            dataType: 'json',
            data: JSON.stringify(postJson)
        })
        
        if(result.data.errcode){
            console.log('故障报修通知发送失败')
        }

    }
}

module.exports = pushNotification;