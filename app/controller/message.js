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
            if (ctx.userInfo.cardnum === staffCardnum) {
                // 创建消息的是维修人员
                let now = +moment();
                ctx.service.pushNotification.userNotification(
                    userCardnum,
                    '亲爱的用户您好，针对你反馈的问题，工作人员的有了新的回复，请即时查看',
                    resOfTroubleId.address,
                    resOfTroubleId.typeName,
                    '故障处理中',
                    moment(now).format('YYYY-MM-DD HH:mm:ss'),
                    '消息内容：'+message,
                    this.ctx.helper.oauthUrl(ctx, 'detail', resOfTroubleId._id)
                )

                let newChatInfo = ctx.model.ChatInfo({
                    time: now,
                    fromWho: 'staff',
                    troubleId: id,
                    content: message
                })
                await newChatInfo.save();
            }
            //消息来自用户
            else if(ctx.userInfo.cardnum === userCardnum) {
                let now = +moment();

                ctx.service.pushNotification.staffNotification(
                    staffCardnum,
                    `用户${userCardnum}对反馈的问题进行了补充，请注意查看`,
                    resOfTroubleId._id.toString().toUpperCase(),
                    resOfTroubleId.typeName,
                    resOfTroubleId.desc,
                    resOfTroubleId.phonenum,
                    moment(resOfTroubleId.createdTime).format('YYYY-MM-DD HH:mm:ss'),
                    '消息内容：'+message,
                    this.ctx.helper.oauthUrl(ctx, 'detail', resOfTroubleId._id) // url - 故障详情页面
                )

                let newChatInfo = ctx.model.ChatInfo({
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
        let troubleId = ctx.query.troubleId;
        let resOfTroubleId = await ctx.model.ChatInfo.find({ troubleId }, ['content', 'time', 'fromWho'], { sort: { time: 1 } });
        return resOfTroubleId;
    }

}

module.exports = MessageController;