'use strict'
const moment = require('moment');
module.exports = options => {
    return async function auth(ctx, next) {
        //临时进行身份验证
        
        let openID = ctx.request.query.openid;
        let result = await ctx.model.User.find({ openid: openID });
        if (result.length === 0) {
            //没有用户信息
            //判断是否注册新用户
            if(ctx.request.body.Content.startsWith('注册')){
                let cardNum = ctx.request.body.Content.split(' ')[1];
                let newPerson = ctx.model.User({
                    cardNum: cardNum,
                    indentityType: '游客',
                    Institute: '',
                    name: '',
                    openid: ctx.request.query.openid,
                });
                await newPerson.save();
                ctx.response.body = '';
                return;
            }else{
                ctx.response.body =
                `
                <xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${moment().unix()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[没有用户信息]]></Content>
                </xml>
                `
                return;
            }

        }else{
            //有用户信息
            //判断用户的权限
            ctx.request.body.indentityType = result[0].indentityType;
            ctx.request.body.Institute = result[0].Institute;
            await next();
        }

       
    }
}