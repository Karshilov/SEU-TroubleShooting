'use strict';
const Service = require('egg').Service;
const moment = require('moment');
// const uuid = require('uuid/v4');

class keywordsService extends Service {
  async process(ctx) {
    const dispatchKeywords = {
      初始化管理员: this.initAdmin,
      管理后台: this.configUI,
      任务清单: this.todolList,
      初始管理员转让: this.changeAdmin,
      // 注销: this.logOut,
      // 微信签到功能
      签到: this.checkIn,
    };
    const dispatchClickEvent = {
      故障申报: 'post',
      处理进度: 'list_USER',
    };
    this.ctx.logger.info('微信服务器请求：%j', ctx.request.body);
    let keyword;
    try {
      keyword = ctx.request.body.Content.split(' ')[0];
      // eslint-disable-next-line no-empty
    } catch (e) { }
    if (ctx.request.body.MsgType === 'text' && dispatchKeywords[keyword]) {
      // 响应关键字
      const res = await dispatchKeywords[keyword](ctx.request.body, ctx);
      ctx.status = 200;
      if (!res) {
        ctx.status = 200;
        ctx.body = 'success';
      } else {
        ctx.body = `<xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${+moment()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${res}]]></Content>
                </xml>`;
      }
    } else if (ctx.request.body.MsgType === 'event' && ctx.request.body.Event === 'CLICK' && dispatchClickEvent[ctx.request.body.EventKey]) {
      ctx.status = 200;
      ctx.status = 200;
    } else if (ctx.request.body.MsgType === 'event' && ctx.request.body.Event === 'subscribe') {
      // 关注时推送
      ctx.status = 200;
      //       ctx.body = `<xml>
      //                     <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
      //                     <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
      //                     <CreateTime>${+moment()}</CreateTime>
      //                     <MsgType><![CDATA[text]]></MsgType>
      //                     <Content><![CDATA[感谢您关注东南大学网络与信息中心官方微信平台！
      // 🌈点击下方“最新动态”，可查看网络与信息中心各部门联系方式及通知公告；
      // 🛠校园网服务咨询及故障报修，请致电025-83790808；
      // 🛠学生宿舍网络故障报修，请致电025-58710000。

      // SEIC小助手提醒您：
      // ⭐️全新报障系统即将上线！敬请期待！
      // ⭐️有奖问卷正在进行中～
      // 点击下方“有奖问卷”即可参与答题～]]></Content>
      //                 </xml>`;
      ctx.body = 'success';
    } else {
      ctx.body = 'success';
    }
  }

  async initAdmin(body, ctx) {
    const openid = body.FromUserName;
    // 判断是否已经初始化过
    const adminCount = await ctx.model.User.countDocuments({ isAdmin: true });
    if (adminCount > 0) {
      return '非法操作，此事件将被报告';
    }
    // 首先判断数据库是否存在该用户
    let user = await ctx.model.User.findOne({ openid });
    if (user) {
      user.isAdmin = true;
      await user.save();
    } else {
      user = new ctx.model.User({
        openid,
        isAdmin: true,
        token: 'fake_token',
        tokenExpireTime: 0,
      });
      await user.save();
    }
    return '您已成为系统的初始管理员';
  }

  async configUI(body, ctx) {
    const openid = body.FromUserName;
    const user = await ctx.model.User.findOne({ openid });
    if (user && user.isAdmin) {
      return `<a href="${ctx.helper.oauthUrl(ctx, 'config')}">点击打开后台管理</a>`;
    }
  }

  async todolList(body, ctx) {
    // 适时考虑一下鉴权
    return `<a href="${ctx.helper.oauthUrl(ctx, 'list', 'STAFF')}">点击查看任务清单</a>`;
  }

  async changeAdmin(body, ctx) {
    const openid = body.FromUserName;
    const targetCardnum = body.Content.split(' ')[1];
    // 管理员身份确定
    const recordOfAdmin = await ctx.model.User.findOne({ openid });
    if (!(recordOfAdmin && recordOfAdmin.isAdmin)) {
      return '非管理员，禁止操作';
    }
    // 查找目标人员
    const recordOfCardnum = await ctx.model.User.findOne({ cardnum: targetCardnum });
    if (!recordOfCardnum) {
      return '转让目标不存在';
    }

    recordOfAdmin.isAdmin = false;
    recordOfCardnum.isAdmin = true;

    await recordOfAdmin.save();
    await recordOfCardnum.save();

    return '管理员转让成功';

  }

  async checkIn() {
    return '<a href="https://seicwxbz.seu.edu.cn/checkin">点击进入快捷签到</a>';
  }

  // 注销功能会对原有的数据造成破坏
  // async logOut(body, ctx) {
  //   // 鉴权，仅对管理员开放此功能
  //   const openid = body.FromUserName;
  //   const user = await ctx.model.User.findOne({ openid });
  //   const targetCardnum = body.Content.split(' ')[1];
  //   if (!(user && user.isAdmin)) {
  //     return '非管理员，禁止操作';
  //   }
  //   const recordOfCardnum = await ctx.model.User.findOne({ cardnum: targetCardnum });
  //   if (!recordOfCardnum) {
  //     return '注销目标不存在';
  //   }
  //   console.log('targetCardnum:' + targetCardnum);
  //   await ctx.model.Ids.deleteMany({ openId: openid });
  //   await ctx.model.StaffBind.deleteOne({ staffCardnum: targetCardnum });
  //   await ctx.model.DepartmentAdminBind.deleteOne({ adminCardnum: targetCardnum });
  //   await ctx.model.User.deleteOne({ cardnum: targetCardnum });

  //   return '删除目标用户成功';

  // }
}

module.exports = keywordsService;
