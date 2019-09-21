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


        //确定改用户是否已经绑定
        if (ctx.userInfo.cardnum !== '') {
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

        ctx.userInfo.name = ctx.request.body.name;
        ctx.userInfo.cardnum = ctx.request.body.cardnum;
        ctx.userInfo.phonenum = ctx.request.body.phonenum;
        ctx.userInfo.address = ctx.request.body.address ? ctx.request.body.address : '';

        await ctx.userInfo.save();


    }
    //获取用户信息
    async index() {
        const { ctx } = this;


        // 确定用户是否绑定信息
        if (!ctx.userInfo.cardnum) {
            //用户未绑定信息
            ctx.error(1, '未绑定用户信息');
        }

        return {
            "cardnum": ctx.userInfo.cardnum,
            "name": ctx.userInfo.cardnum,
            "address": ctx.userInfo.address,
            "phonenum": ctx.userInfo.phonenum
        }


    }
    //解除绑定
    async unbind() {
        const { ctx } = this;
        let cardnum = ctx.request.body.cardnum;

        let resOfCardnum = await ctx.model.User.findOne({ cardnum });

        if (ctx.userInfo.isAdmin) {
            //管理员权限，可以解除所有的绑定
            if (!resOfCardnum) {
                ctx.error(-4, '没有查询结果');
            }
            resOfCardnum.cardnum = '';
            resOfCardnum.save();
        } else {
            //普通用户权限，只能解除自己的绑定
            if (!resOfCardnum) {
                ctx.error(-4, '没有查询结果');
            }
            if (ctx.userInfo.cardnum === cardnum && resOfCardnum.cardnum === cardnum) {
                resOfCardnum.cardnum = '';
                resOfCardnum.name = '';
                resOfCardnum.address = '';
                resOfCardnum.phonenum = '';
                resOfCardnum.save();
            } else {
                ctx.error(1, '权限不足');
            }
        }
    }
    //设置管理员
    async setAdmin() {
        const { ctx } = this;
        if (ctx.userInfo.isAdmin) {
            let resOfCardnum = await ctx.model.User.findOne({ cardnum: ctx.request.body.cardnum });
            if (!resOfCardnum) {
                ctx.error(-4, '没有查询结果');
            }
            else {
                resOfCardnum.isAdmin = true;
                resOfCardnum.save();
            }
        } else {
            ctx.permissionError();
        }
    }
    //删除管理员
    async deleteAdmin(){
        const { ctx } = this;
        if (ctx.userInfo.isAdmin) {
            let resOfCardnum = await ctx.model.User.findOne({ cardnum: ctx.request.body.cardnum });
            if (!resOfCardnum) {
                ctx.error(-4, '没有查询结果');
            }
            else {
                resOfCardnum.isAdmin = false;
                resOfCardnum.save();
            }
        } else {
            ctx.permissionError();
        }
    }
}

module.exports = userController;