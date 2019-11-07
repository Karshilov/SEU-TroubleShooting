'use strict';
const Service = require('egg').Service;
const moment = require('moment');
const uuid = require('uuid/v4');

class keywordsService extends Service {
  async process(ctx) {
    const dispatchKeywords = {
      初始化管理员: this.initAdmin,
      管理后台: this.configUI,
      任务清单: this.todolList,
      初始管理员转让: this.changeAdmin,
    };
    const dispatchClickEvent = {
      故障申报: 'post',
      处理进度: 'list_USER',
    };
    console.log(ctx.request.body);
    let keyword;
    try {
      keyword = ctx.request.body.Content.split(' ')[0];
    // eslint-disable-next-line no-empty
    } catch (e) { }
    if (dispatchKeywords[keyword]) {
      // 响应关键字
      const res = await dispatchKeywords[keyword](ctx.request.body, ctx);
      console.log(res);
      ctx.status = 200;
      if (!res) {
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
    } else if (dispatchClickEvent[ctx.request.body.EventKey]) {
      // 响应click事件
      const resOfOpenid = await ctx.model.User.findOne({ openid: ctx.request.body.FromUserName });
      if (resOfOpenid) {
        // 用户已经绑定
        const state = dispatchClickEvent[ctx.request.body.EventKey];
        const redirectURL = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ctx.app.config.wechat.appID}&redirect_uri=${ctx.app.config.serverURL}wechatOauth&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
        const content = `<a href="${redirectURL}">点击继续</a>`;
        ctx.body = `<xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${+moment()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${content}]]></Content>
                </xml>`;
      } else {
        // 用户没有绑定
        const idsSession = uuid();
        const newIds = new ctx.model.Ids({
          idsSession,
          openId: ctx.request.body.FromUserName,
          target: dispatchClickEvent[ctx.request.body.EventKey],
        });
        await newIds.save();
        const content = `<a href="https://myseu.cn" data-miniprogram-appid="wxaef6d2413690047f" data-miniprogram-path="pages/idsAuth?APPID=${ctx.app.config.wechat.appID}&IDS_SESSION=${idsSession}&FORCE=1">统一身份认证登录</a>`;
        ctx.body = `<xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${+moment()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${content}]]></Content>
                </xml>`;
      }
    } else {
      ctx.body = 'success';
    }
  }

  async initAdmin(body, ctx) {
    console.log(body);
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
}

module.exports = keywordsService;
