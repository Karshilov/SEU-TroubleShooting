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
      我中奖了: this.prize,
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
    } else if (ctx.request.body.MsgType === 'text' && keyword === '我中奖了') {
      // 响应非功能性关键字
      ctx.status = 200;
      // const keyRecord = await ctx.model.KeyWords.find({});
      // let content = '';
      // keyRecord.forEach(item => {
      //   if (item.key === keyword) {
      //     content = item.content;
      //   }
      // });
      // if (content) {
      //   // console.log(content);
      ctx.body = `<xml>
                          <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                          <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                          <CreateTime>${+moment()}</CreateTime>
                          <MsgType><![CDATA[text]]></MsgType>
                          <Content><![CDATA[<a href="https://www.wjx.cn/jq/54509382.aspx">点击填写获奖者信息统计表</a>]]></Content>
                      </xml>`;
      // ctx.body = `<xml>
      // <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
      // <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
      // <CreateTime>${+moment()}</CreateTime>
      // <MsgType><![CDATA[news]]></MsgType>
      // <ArticleCount>1</ArticleCount>
      // <Articles>
      //   <item>
      //     <Title><![CDATA[测试]]></Title>
      //     <Description><![CDATA[测试一下]]></Description>
      //     <PicUrl><![CDATA[]]></PicUrl>
      //     <Url><![CDATA[${content}]]></Url>
      //   </item>
      // </Articles>
      // </xml>`;
      // } else {
      //   ctx.body = 'success';
      // }
    } else if (ctx.request.body.MsgType === 'event' && ctx.request.body.Event === 'CLICK' && dispatchClickEvent[ctx.request.body.EventKey]) {
      ctx.status = 200;
      ctx.status = 200;
    } else if (ctx.request.body.MsgType === 'event' && ctx.request.body.Event === 'subscribe') {
      // 关注时推送
      ctx.status = 200;
      // const keyRecord = await ctx.model.KeyWords.find({});
      // let content = '';
      // keyRecord.forEach(item => {
      //   if (item.key === '首次关注') {
      //     content = item.content;
      //   }
      // });
      // if (content) {
      //   // console.log(content);
      //   ctx.body = `<xml>
      //                     <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
      //                     <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
      //                     <CreateTime>${+moment()}</CreateTime>
      //                     <MsgType><![CDATA[text]]></MsgType>
      //                     <Content><![CDATA[${content}]]></Content>
      //                 </xml>`;
      // } else {
      //   ctx.body = 'success';
      // }

      ctx.body = `<xml>
                          <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                          <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                          <CreateTime>${+moment()}</CreateTime>
                          <MsgType><![CDATA[text]]></MsgType>
                          <Content><![CDATA[终于等到你[爱心]
我们是东南大学网络与信息中心，致力于为全体师生提供更好、更全、更强的信息化服务。
感谢你的关注，下方菜单栏里有更多功能等你探索[机智]
[拳头]抗“疫”特殊时期，不在前线，却守一线，不在战场，仍稳后方。
【疫情上报】：请点击下方“自助服务”——“疫情上报”
💪任何服务出现问题，均可通过网络报修平台快速线上报障～
【网络报修】：点击下方“网络报修”
                          
共同抗“疫”,中国加油！]]></Content>
                      </xml>`;
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

  async prize() {
    return '<a href="https://www.wjx.cn/jq/54509382.aspx">点击进入领奖登记</a>'
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
