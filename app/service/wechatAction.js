'use strict'
const Service = require('egg').Service
const moment = require('moment')
const uuid = require('uuid/v4')

class keywordsService extends Service {
    async process(ctx) {
        let dispatchKeywords = {
            '初始化管理员': this.initAdmin,
            '管理后台': this.configUI,
            '任务清单': this.todolList,
        }
        let dispatchClickEvent = {
            '故障申报': "post",
            '处理进度': "list_USER"
        }
        console.log(ctx.request.body)
        if (dispatchKeywords[ctx.request.body.Content]) {
            //响应关键字
            let res = await dispatchKeywords[ctx.request.body.Content](ctx.request.body, ctx)
            console.log(res)
            ctx.status = 200
            if (!res) {
                ctx.body = 'success'
            } else {
                ctx.body = `<xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${+moment()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${res}]]></Content>
                </xml>`
            }
        } else if (dispatchClickEvent[ctx.request.body.EventKey]) {
            //响应click事件
            let resOfOpenid = await ctx.model.User.findOne({ openid: ctx.request.body.FromUserName })
            if (resOfOpenid) {
                // 用户已经绑定
                let state = dispatchClickEvent[ctx.request.body.EventKey]
                let redirectURL = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ctx.app.config.wechat.appID}&redirect_uri=${ctx.app.config.serverURL}wechatOauth&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`
                let content = `<a href="${redirectURL}">点击继续</a>`
                ctx.body = `<xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${+moment()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${content}]]></Content>
                </xml>`
            } else {
                //用户没有绑定
                let idsSession = uuid()
                let newIds = new ctx.model.Ids({
                    idsSession: idsSession,
                    openId: ctx.request.body.FromUserName,
                    target: dispatchClickEvent[ctx.request.body.EventKey]
                })
                let res = await newIds.save()
                let content = `<a href="https://myseu.cn" data-miniprogram-appid="wxaef6d2413690047f" data-miniprogram-path="pages/idsAuth?APPID=${ctx.app.config.wechat.appID}&IDS_SESSION=${idsSession}&FORCE=1">统一身份认证登录</a>`
                ctx.body = `<xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${+moment()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${content}]]></Content>
                </xml>`
            }
        }
        else {
            ctx.body = 'success'
        }
    }

    async initAdmin(body, ctx) {
        console.log(body)
        let openid = body.FromUserName
        // 判断是否已经初始化过
        let adminCount = await ctx.model.User.countDocuments({ isAdmin: true })
        if (adminCount > 0) {
            return '非法操作，此事件将被报告'
        }
        // 首先判断数据库是否存在该用户
        let user = await ctx.model.User.findOne({ openid })
        if (user) {
            user.isAdmin = true
            await user.save()
        } else {
            user = new ctx.model.User({
                openid,
                isAdmin: true,
                token: 'fake_token',
                tokenExpireTime: 0
            })
            await user.save()
        }
        return '您已成为系统的初始管理员'
    }

    async configUI(body, ctx) {
        let openid = body.FromUserName
        let user = await ctx.model.User.findOne({ openid })
        if (user && user.isAdmin) {
            return `<a href="${ctx.helper.oauthUrl(ctx, 'config')}">点击打开后台管理</a>`
        }
    }

    async todolList(body, ctx) {
        return `<a href="${ctx.helper.oauthUrl(ctx, 'list', 'STAFF')}">点击查看任务清单</a>`
    }

}

module.exports = keywordsService;