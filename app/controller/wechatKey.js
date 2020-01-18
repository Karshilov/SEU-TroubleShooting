'use strict';

const Controller = require('egg').Controller;

class wechatKey extends Controller {
  async list() {
    // 获取关键字回复列表
    // 鉴权
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    console.log('到达');
    let keyRecord = [];
    try {
      // keyRecord = await ctx.model.KeyWords.find({});
    } catch (e) {
      console.log(e);
    }
    
    // 返回格式处理
    // eslint-disable-next-line prefer-const
    console.log('keyReord:' + keyRecord);
    let res = {
      首次回复: '',
      record: [],
    };
    console.log('1.res:' + res);
    keyRecord.forEach(item => {
      if (item.key === '首次关注') {
        res['首次关注'] = item.content;
      } else {
        res.record.push(item);
      }
    });
    console.log('2.res:' + res);
    return res;
  }

  async add() {
    // 增加关键字回复或修改关键字回复内容
    // 鉴权
    const { ctx } = this;
    const { KeyWord, content } = ctx.request.body;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    if (!(KeyWord && content)) {
      ctx.error(1, '关键字或者回复内容未设置');
    }
    const keyRecord = await ctx.model.KeyWords.findOne({ key: KeyWord });
    if (keyRecord) {
      keyRecord.content = content;
      await keyRecord.save();
    } else {
      const newKey = new ctx.model.KeyWords({
        key: KeyWord,
        content,
      });
      await newKey.save();
    }
    return '设置成功';
  }

  async delete() {
    // 删除关键字回复
    // 鉴权
    const { ctx } = this;
    const { KeyWord } = ctx.query;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    const keyRecord = await ctx.model.KeyWords.findOne({ key: KeyWord });
    if (!keyRecord) {
      ctx.error(2, '未设置该关键字');
    }
    await ctx.model.KeyWords.deleteOne({ key: KeyWord });
    return '删除成功';

  }
}

module.exports = wechatKey;
