'use strict'
const Controller = require('egg').Controller
const sha1 = require('js-sha1')
const moment = require('moment');
const uuid = require('uuid/v4');

class callbackController extends Controller {
    async callback() {
        // 根据ids小程序返回redirectURL
        const { ctx } = this
        let { ids_session, name, cardnum, challenge, signature } = ctx.request.body
        
        // 验证时请求是否来自ids小程序
        let str = `cardnum=${cardnum}&name=${name}&session=${ids_session}&challenge=${challenge}&secret=${ctx.app.config.secret}`

        if (signature !== sha1(str)) {
            ctx.error(-1, "不是来自ids认证的请求，拒绝请求")
        }

        // 获取用户的openid，创建新的用户
        let resOfidsSession = await ctx.model.IDS.find({ idsSession: ids_session })
        let token = uid()
        let newPerson = this.ctx.model.User({
            openId: resOfidsSession.openid,
            cardnum: cardnum,
            name: name,
            token: token,
            tokenExpireTime: +moment() + 30 * 60 * 1000
        });
        let res = await newPerson.save();

        // 向用户推送redirectURL
        let state = resOfidsSession.target.split('_')
        let redirectURL = ctx.app.config.redirectURL + `#/${state[0]}/${token}${state[1] ? '/' + state[1] : ''}`
        let content = `点击链接继续<a href=${redirectURL}`
        await ctx.service.replyMessage.reply(resOfidsSession.openId, content)

    }
}

module.exports = callbackController;