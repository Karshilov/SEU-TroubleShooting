'use strict'
const Service = require('egg').Service
const moment = require('moment')

class keywordsService extends Service {
    async process(ctx) {
        let dispatch = {
            '初始化管理员': this.initAdmin,
            '管理后台': this.configUI,
            '任务清单': this.todolList,
        }
        if (dispatch[ctx.request.body.Content]) {
            let res = await dispatch[ctx.request.body.Content](ctx.request.body, ctx)
            ctx.status = 200
            ctx.body = `<xml>
                <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                <CreateTime>${+moment()}</CreateTime>
                <MsgType><![CDATA[text]]></MsgType>
                <Content><![CDATA[${res}]]></Content>
            </xml>`
        } else {
            ctx.body = 'success'
        }
    }

    async initAdmin(body, ctx) {
        console.log(body)
        let openid = body.FromUserName
        // 判断是否已经初始化过
        let adminCount = await ctx.model.User.countDocuments({isAdmin:true})
        if(adminCount > 0){
            return '非法操作，此事件将被报告'
        }
        // 首先判断数据库是否存在该用户
        let user = await ctx.model.User.findOne({openid})
        if(user){
            user.isAdmin = true
            await user.save()
        } else {
            user = new ctx.model.User({
                openid,
                isAdmin:true,
                token:'fake_token',
                tokenExpireTime:0
            })
            await user.save()
        }
        return '您已成为系统的初始管理员'
    }

    async configUI(body, ctx){
        let openid = body.FromUserName
        let user = await ctx.model.User.findOne({openid})
        if(user && user.isAdmin){
            return `<a href="${ctx.helper.oauthUrl(ctx, 'config')}">点击打开后台管理</a>`
        }
    }

    async todolList(body, ctx){
        return `<a href="${ctx.helper.oauthUrl(ctx, 'list', 'STAFF')}">点击查看任务清单</a>`
    }
}

module.exports = keywordsService;