'use strict'

const Controller = require('egg').Controller;
const moment = require('moment');
const statusDisp = {
    'PENDING': '处理中',
    'DONE': '处理完成，等待验收',
    'ACCEPT': '故障已解决',
    'REJECT': '故障仍未解决',
    'CLOSED': '已关闭',
    'SPAM': '无效信息'
}

class MessageController extends Controller {
    //创建消息
    async createMessage() {
        const { ctx } = this;
        if (ctx.userInfo.isAdmin) {
            ctx.permissionError('管理员无权查看');
        }

        let id = ctx.request.body.troubleId; //故障Id
        let message = ctx.request.body.message; //消息内容

        let resOfTroubleId = await ctx.model.Trouble.findById(id);
        if (!resOfTroubleId) {
            ctx.error(-4, '没有查询到相关故障信息');
        }

        if (resOfTroubleId.status === 'PENDING') {
            //向双方推送消息

            //用户和工作人员的一卡通号
            let userCardnum = resOfTroubleId.userCardnum;
            let staffCardnum = resOfTroubleId.staffCardnum;

            //消息来自维修人员
            if (ctx.userInfo.isWorker) {
                // 创建消息的是维修人员
                let now = +moment();
                ctx.service.pushNotification.userNotification(
                    cardnum = userCardnum,
                    title = '亲爱的用户您好，针对你反馈的问题，维修人员的有了新的回复，请即时查看',
                    address = resOfTroubleId.address,
                    type = resOfTroubleId.typeName,
                    status = '故障处理中',
                    lastModifiedTime = now,
                    remark = message,
                    url = ''
                )

                ctx.service.pushNotification.staffNotification(
                    cardnum = staffCardnum,
                    title = `针对用户${userCardnum}反馈的问题，您做了新的回复，请做好相关记录`,
                    code = resOfTroubleId._id.toUpperCase(),
                    type = resOfTroubleId.typeName,
                    desc = resOfTroubleId.desc,
                    phoneNum = resOfTroubleId.phoneNum,
                    createdTime = resOfTroubleId.createdTime,
                    remark = message,
                    url = ''
                )

                let newChatInfo = ctx.model.chatInfo({
                    time: now,
                    fromWho: 'staff',
                    troubleId: id,
                    content: message
                })
                await newChatInfo.save();
            }
            //消息来自用户
            else {
                let now = +moment();
                ctx.service.pushNotification.userNotification(
                    cardnum = userCardnum,
                    title = '亲爱的用户您好，您对反馈的问题进行了补充',
                    address = resOfTroubleId.address,
                    type = resOfTroubleId.typeName,
                    status = '故障处理中',
                    lastModifiedTime = now,
                    remark = message,
                    url = ''
                )

                ctx.service.pushNotification.staffNotification(
                    cardnum = staffCardnum,
                    title = `用户${userCardnum}对反馈的问题进行了补充，请做好相关记录`,
                    code = resOfTroubleId._id.toUpperCase(),
                    type = resOfTroubleId.typeName,
                    desc = resOfTroubleId.desc,
                    phoneNum = resOfTroubleId.phoneNum,
                    createdTime = resOfTroubleId.createdTime,
                    remark = message,
                    url = ''
                )

                let newChatInfo = ctx.model.chatInfo({
                    time: now,
                    fromWho: 'staff',
                    troubleId: id,
                    content: message
                })
                await newChatInfo.save();
            }
        }
        else {
            //仅仅向一方推送消息
            //用户和工作人员的一卡通号
            let userCardnum = resOfTroubleId.userCardnum;
            let staffCardnum = resOfTroubleId.staffCardnum;
            let statusDispname = status[`${resOfTroubleId.status}`];
            let now = +moment();
            if (ctx.userInfo.isWorker) {
                //来自维修人员的消息，向用户推送
                ctx.service.pushNotification.userNotification(
                    cardnum = userCardnum,
                    title = '亲爱的用户您好，针对你反馈的问题，维修人员的有了新的回复，请即使查看',
                    address = resOfTroubleId.address,
                    type = resOfTroubleId.typeName,
                    status = statusDispname,
                    lastModifiedTime = now,
                    remark = message,
                    url = ''
                )

                let newChatInfo = ctx.model.chatInfo({
                    time: now,
                    fromWho: 'staff',
                    troubleId: id,
                    content: message
                })
                await newChatInfo.save();

            }
            else {
                //来自用户的消息，向维修人员推送
                ctx.service.pushNotification.staffNotification(
                    cardnum = staffCardnum,
                    title = `用户${userCardnum}对反馈的问题进行了补充，请做好相关记录`,
                    code = resOfTroubleId._id.toUpperCase(),
                    type = resOfTroubleId.typeName,
                    desc = resOfTroubleId.desc,
                    phoneNum = resOfTroubleId.phoneNum,
                    createdTime = resOfTroubleId.createdTime,
                    remark = message,
                    url = ''
                )
                let newChatInfo = ctx.model.chatInfo({
                    time: now,
                    fromWho: 'user',
                    troubleId: id,
                    content: message
                })
                await newChatInfo.save();
            }
        }
    }
    //获取消息列表
    async listMessage() {
        const { ctx } = this;
        if (ctx.userInfo.isAdmin) {
            ctx.identityError('管理员无权查看');
        }
        let troubleId = ctx.request.query.troubleId;
        let resOfTroubleId = await ctx.model.ChatInfo.find({ troubleId: troubleId });
        let resOfreturn = [];
        resOfTroubleId.forEach(k => {
            resOfreturn.push({
                "content": k.content,
                "time": k.time,
                "fromWho": k.fromWho
            })
        })
        resOfTroubleId = resOfTroubleId.sort((m, n) => {
            return m.time - n.time;
        })

        return resOfreturn;

    }

}

module.exports = MessageController;