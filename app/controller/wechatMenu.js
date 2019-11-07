'use strict';

const Controller = require('egg').Controller;

// 微信菜单配置页面
class WechatMenuController extends Controller {
  async get() {
    // 获取当前菜单结构
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    const menuRecord = await this.ctx.model.Menu.find({});
    console.log(menuRecord);
    const res = {
      LEFT: { title: '', sub: [] },
      CENTER: { title: '', sub: [] },
      RIGHT: { title: '', sub: [] },

    };
    // 获取一级按钮
    menuRecord.forEach(r => {
      if (r.level === 1) {
        res[r.position] = {
          title: r.title,
          sub: [],
        };
      }
    });
    // 获取二级按钮
    menuRecord.forEach(r => {
      if (r.level === 2) {
        res[r.position].sub.push(r);
      }
    });
    // 二级菜单按钮排序
    Object.keys(res).forEach(position => {
      res[position].sub = res[position].sub.sort((a, b) => {
        return a.order > b.order;
      });
    });
    return res;
  }

  async add() {
    // 添加/修改条目
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    const { level, position, title, url } = ctx.request.body;
    // 如果是一级菜单
    if (level === 1) {
      const currentRecord = await ctx.model.Menu.findOne({ level, position });
      if (currentRecord) {
        // 如果存在该菜单则修改其标题
        currentRecord.title = title;
        await currentRecord.save();
      } else {
        // 不存在则创建
        // 创建之前检查 position 取值是否合法
        if (['LEFT', 'CENTER', 'RIGHT'].indexOf(position) === -1) {
          ctx.error(1, '菜单位置不合法');
        }
        const newRecord = new ctx.model.Menu({
          title,
          level: 1,
          position,
        });
        await newRecord.save();
        return '设置成功';
      }
    } else if (level === 2) {
      // 如果是二级菜单
      // 先检查一级菜单是否存在，若一级菜单不存在则提示设置
      const levelOneRecord = await ctx.model.Menu.findOne({
        position,
        level: 1,
      });
      if (!levelOneRecord) {
        ctx.error(2, '请先设置一级菜单标题');
      }
      // 一级菜单存在，继续进行设置
      // 检查当前二级菜单个数，如果二级菜单个数超过 5 个则不允许继续添加
      if ((await ctx.model.Menu.countDocuments({ level, position })) >= 5) {
        ctx.error(3, '最多设置五个二级菜单');
      }
      // 获取目前已有菜单的 order
      let currentOrder = await ctx.model.Menu.find({}, ['order'], {
        limit: 1,
        sort: { order: -1 },
      });
      currentOrder = currentOrder.length ? currentOrder[0].order : 0;
      // 创建新的菜单
      const newRecord = new ctx.model.Menu({
        title,
        url,
        level: 2,
        position,
        order: currentOrder + 1,
      });
      await newRecord.save();
      return '创建成功';
    }
  }

  async exchange() {
    // 交换条目次序
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    const { id1, id2 } = ctx.request.body;
    const record1 = await ctx.model.Menu.findById(id1);
    const record2 = await ctx.model.Menu.findById(id2);
    if (record1 && record2) {
      const m = record1.order;
      record1.order = record2.order;
      record2.order = m;
      await record1.save();
      await record2.save();
      return '设置成功';
    }
    ctx.error(4, '指定条目不存在');
  }

  async delete() {
    // 删除条目
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    const { id } = ctx.query;
    await ctx.model.Menu.findByIdAndDelete(id);
    return 'success';
  }

  async push() {
    // 向微信服务器推送菜单设置
    const { ctx } = this;
    const rawMenu = [[], [], []];
    const menu = [];
    const menuData = [];
    const menuRecord = await this.ctx.model.Menu.find();
    const access_token = await ctx.service.getAccessToken.accessToken();

    // 替换链接并且分类
    menuRecord.forEach(k => {
      if (k.title === '故障申报' && k.level === 2) {
        let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=<APPID>&redirect_uri=<SERVER_URL>wechatOauth&response_type=code&scope=snsapi_base&state=post#wechat_redirect';
        url = url.replace(/<SERVER_URL>/g, ctx.app.config.serverURL).replace(/<APPID>/g, ctx.app.config.wechat.appID);
        k.url = url;
      }
      if (k.title === '处理进度' && k.level === 2) {
        let url = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=<APPID>&redirect_uri=<SERVER_URL>wechatOauth&response_type=code&scope=snsapi_base&state=list_USER#wechat_redirect';
        url = url.replace(/<SERVER_URL>/g, ctx.app.config.serverURL).replace(/<APPID>/g, ctx.app.config.wechat.appID);
        k.url = url;
      }

      if (k.position === 'LEFT') {
        if (k.level === 1) {
          menu.push({
            name: k.title,
            sub_button: [],
          });
        } else {
          rawMenu[0].push(k);
        }
      } else if (k.position === 'CENTER') {
        if (k.level === 1) {
          menu.push({
            name: k.title,
            sub_button: [],
          });
        } else {
          rawMenu[1].push(k);
        }
      } else if (k.position === 'RIGHT') {
        if (k.level === 1) {
          menu.push({
            name: k.title,
            sub_button: [],
          });
        } else {
          rawMenu[2].push(k);
        }
      }
      // 没有链接，设置链接为信息中心
      k.url = k.url ? k.url : 'https://nic.seu.edu.cn';
    });


    // 子菜单进行排序并导入
    rawMenu.forEach(k => {
      k.sort((a, b) => {
        return a.order - b.order;
      });
      k.forEach(subMenu => {
        if (subMenu.position === 'LEFT') {
          if (subMenu.title === '故障申报') {
            menu[0].sub_button.push({
              type: 'view',
              name: subMenu.title,
              key: '故障申报',
            });
          } else if (subMenu.title === '处理进度') {
            menu[0].sub_button.push({
              type: 'view',
              name: subMenu.title,
              key: '处理进度',
            });
          } else {
            menu[0].sub_button.push({
              type: 'view',
              name: subMenu.title,
              url: subMenu.url,
            });
          }
        }
        if (subMenu.position === 'CENTER') {
          if (subMenu.title === '故障申报') {
            menu[1].sub_button.push({
              type: 'view',
              name: subMenu.title,
              key: '故障申报',
            });
          } else if (subMenu.title === '处理进度') {
            menu[1].sub_button.push({
              type: 'view',
              name: subMenu.title,
              key: '处理进度',
            });
          } else {
            menu[1].sub_button.push({
              type: 'view',
              name: subMenu.title,
              url: subMenu.url,
            });
          }
        }
        if (subMenu.position === 'RIGHT') {
          if (subMenu.title === '故障申报') {
            menu[2].sub_button.push({
              type: 'view',
              name: subMenu.title,
              key: '故障申报',
            });
          } else if (subMenu.title === '处理进度') {
            menu[2].sub_button.push({
              type: 'view',
              name: subMenu.title,
              key: '处理进度',
            });
          } else {
            menu[2].sub_button.push({
              type: 'view',
              name: subMenu.title,
              url: subMenu.url,
            });
          }
        }
      });
    });

    // 删除子菜单为空的主菜单
    // 如果只有一个子菜单则成为主菜单
    menu.forEach(sub => {
      if (sub.sub_button.length !== 0) {
        menuData.push(sub);
      } else if (sub.sub_button.length !== 1) {
        menuData.push({
          type: 'view',
          name: sub.sub_button[0].name,
          url: sub.sub_button[0].url,
        });
      }
    });
    console.log(menuData);
    const url = `https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${access_token}`;
    const result = await this.app.curl(url, {
      method: 'POST',
      contentType: 'json',
      data: { button: menuData },
      dataType: 'json',
    });
    if (result.data.errcode) {
      ctx.error(result.data.errcode, result.data.errmsg);
    } else {
      return '设置成功';
    }
  }
}

module.exports = WechatMenuController;
