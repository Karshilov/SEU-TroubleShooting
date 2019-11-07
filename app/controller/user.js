'use strict';

const Controller = require('egg').Controller;


class userController extends Controller {
  // 绑定用户信息
  async bind() {
    const { ctx } = this;
    if (ctx.userInfo.isAdmin || ctx.userInfo.isWorker) {
      // 身份类型不是普通用户
      // 迷惑行为
      // ctx.permissionError();
    }
    // 确定该用户是否已经绑定
    // if (ctx.userInfo.cardnum !== '') {
    //     // 每个OpenID只允许一次绑定
    //     ctx.error(1, "该微信号已绑定过一卡通，请勿重复绑定");
    // }

    // 确定一卡通号是否存在
    // let resOfCardnum = await ctx.model.User.findOne({ cardnum: ctx.request.body.cardnum });
    // if (resOfCardnum) {
    //     // 一卡通号重复
    //     ctx.error(2, "该一卡通号已经绑定过其他微信号，请勿重复绑定");
    // }

    // 确定电话号码是否存在
    const resOfPhonenum = await ctx.model.User.findOne({ phonenum: ctx.request.body.phonenum });
    if (resOfPhonenum) {
      // 电话号码重复
      ctx.error(3, '电话号码已占用');
    }

    // 验证人员信息格式是否正确
    // 不检查一卡通和姓名，不更新一卡通和姓名

    // if (!/\d{9}/.test(ctx.request.body.cardnum)) {
    //     ctx.error(4, "一卡通错误")
    // } else {
    //     ctx.userInfo.cardnum = ctx.request.body.cardnum;
    // }

    // if (!ctx.request.body.name) {
    //     ctx.error(4, "姓名错误")
    // } else {
    //     ctx.userInfo.name = ctx.request.body.name
    // }

    if (!ctx.request.body.phonenum) {
      ctx.error(4, '电话号码错误');
    } else {
      ctx.userInfo.phonenum = ctx.request.body.phonenum;
    }

    ctx.userInfo.address = ctx.request.body.address ? ctx.request.body.address : '';

    await ctx.userInfo.save();


  }
  // 获取用户信息
  async index() {
    const { ctx } = this;


    // 确定用户是否绑定信息
    if (!ctx.userInfo.cardnum) {
      // 用户未绑定信息
      ctx.error(1, '未绑定用户信息');
    }

    return {
      cardnum: ctx.userInfo.cardnum,
      name: ctx.userInfo.name,
      address: ctx.userInfo.address,
      phonenum: ctx.userInfo.phonenum,
    };


  }
  // 解除绑定
  async unbind() {
    const { ctx } = this;
    const cardnum = ctx.request.body.cardnum;

    const resOfCardnum = await ctx.model.User.findOne({ cardnum });

    if (ctx.userInfo.isAdmin) {
      // 管理员权限，可以解除所有的绑定
      if (!resOfCardnum) {
        ctx.error(-4, '没有查询结果');
      }
      resOfCardnum.cardnum = '';
      await resOfCardnum.save();
    } else {
      // 普通用户权限，只能解除自己的绑定
      if (!resOfCardnum) {
        ctx.error(-4, '没有查询结果');
      }
      if (ctx.userInfo.cardnum === cardnum && resOfCardnum.cardnum === cardnum) {
        resOfCardnum.cardnum = '';
        resOfCardnum.name = '';
        resOfCardnum.address = '';
        resOfCardnum.phonenum = '';
        await resOfCardnum.save();
      } else {
        ctx.error(1, '权限不足');
      }
    }
  }
  // 设置管理员
  async setAdmin() {
    const { ctx } = this;
    if (ctx.userInfo.isAdmin) {
      const resOfCardnum = await ctx.model.User.findOne({ cardnum: ctx.request.body.cardnum });
      if (!resOfCardnum) {
        ctx.error(-4, '没有查询结果');
      } else {
        resOfCardnum.isAdmin = true;
        resOfCardnum.adminLevel = ctx.userInfo.adminLevel + 1;
        await resOfCardnum.save();
      }
    } else {
      ctx.permissionError();
    }
  }
  // 删除管理员
  async deleteAdmin() {
    const { ctx } = this;
    if (ctx.userInfo.isAdmin) {
      if (ctx.userInfo.cardnum === ctx.query.cardnum) {
        ctx.error(1, '不能取消自己的管理员资格');
      }
      const resOfCardnum = await ctx.model.User.findOne({ cardnum: ctx.query.cardnum });
      if (!resOfCardnum) {
        ctx.error(-4, '没有查询结果');
      } else if (ctx.userInfo.adminLevel >= resOfCardnum.adminLevel) {
        ctx.error(-3, '不能取消同权限或高权限的管理员资格');
      } else {
        resOfCardnum.isAdmin = false;
        await resOfCardnum.save();
      }
    } else {
      ctx.permissionError();
    }
  }
  // 获取管理员列表
  async adminList() {
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.identityError('没有权限查看管理员名单');
    }

    const resOfAdmin = await ctx.model.User.find({ isAdmin: true }, [ 'cardnum', 'name' ]);

    return resOfAdmin;
  }
}

module.exports = userController;
