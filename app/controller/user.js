'use strict'

const Controller = require('egg').Controller;


class userController extends Controller {
    //绑定用户信息
    async bind() {
        const { ctx } = this;
        if (ctx.userInfo.isAdmin || ctx.userInfo.isWorker) {
            // 身份类型不是普通用户
            ctx.permissionError();
        }

        let token = ctx.request.headers.token;
        let person = await ctx.model.User.findOne({ token });
        //确定改用户是否已经绑定
        if (person.cardnum !== '' && person.name !== '' && person.phoneNum !== '') {
            // 每个OpenID只允许一次绑定
            ctx.error(1, "重复绑定");
        }

        //确定一卡通号是否存在
        let resOfCardnum = await ctx.model.User.findOne({ cardnum: ctx.request.body.cardnum });
        if (resOfCardnum) {
            // 一卡通号重复
            ctx.error(2, "重复绑定");
        }

        //确定电话号码是否存在
        let resOfPhonenum = await ctx.model.User.findOne({ phonenum: ctx.request.body.phonenum });
        if (resOfPhonenum) {
            // 电话号码重复
            ctx.error(3, "电话号码占用");
        }

        person.name = ctx.request.body.name;
        person.cardnum = ctx.request.body.cardnum;
        person.phonenum = ctx.request.body.phonenum;
        person.address = ctx.request.body.address ? ctx.request.body.address : '';

        await person.save();


    }
    //获取用户信息
    async index() {
        const { ctx } = this;
        let token = ctx.request.headers.token;
        let person = await ctx.model.User.findOne({token});

        // 确定用户是否绑定信息
        if(!person.cardnum){
            //用户未绑定信息
            ctx.error(1,'未绑定用户信息');
        }

        return {
            "cardnum":person.cardnum,
            "name":person.cardnum,
            "address":person.address,
            "phonenum":person.phonenum
        }

        
    }
}

module.exports = userController;