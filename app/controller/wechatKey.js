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
    const keyRecordText = await ctx.model.KeyWordsText.find({});
    const keyRecordNews = await ctx.model.KeyWordsNews.find({});
    // 返回格式处理
    return {
      text: keyRecordText,
      news: keyRecordNews,
    };
  }

  async addTextRely() {
    // 增加关键字回复或修改关键字回复内容
    // 鉴权
    const { ctx } = this;
    const { key, content } = ctx.request.body;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    if (!key) {
      ctx.error(1, '未设置关键字');
    }
    // eslint-disable-next-line prefer-const
    let keyRecordText = await ctx.model.KeyWordsText.findOne({ key });
    // 该关键字已经存在，进行修改
    if (keyRecordText) {
      keyRecordText.content = content;
      await keyRecordText.save();
      return '设置成功';
    }
    // eslint-disable-next-line prefer-const
    let keyRecord = [];
    const keyRecordNews = await ctx.model.keyRecordNews.find({});
    keyRecordNews.forEach(item => {
      keyRecord.push(item.key);
    });
    // 每个关键字只能设置一种类型
    if (keyRecord.indexOf(key) !== -1) {
      ctx.error(2, '该关键字的回复类型已设置text');
    }
    const newTextReply = new ctx.model.KeyWordsNews({
      key,
      content,
    });
    await newTextReply.save();
    return '设置成功';
  }

  async addNewsRely() {
    // 增加关键字回复或修改关键字回复内容
    // 鉴权
    const { ctx } = this;
    const { key, title, description, picUrl, url } = ctx.request.body;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    if (!key) {
      ctx.error(1, '未设置关键字');
    }
    // eslint-disable-next-line prefer-const
    let keyRecordNews = await ctx.model.KeyWordsNews.findOne({ key });
    // 该关键字已经存在，进行修改
    if (keyRecordNews) {
      keyRecordNews.title = title;
      keyRecordNews.description = description;
      keyRecordNews.picUrl = picUrl;
      keyRecordNews.url = url;
      await keyRecordNews.save();
      return '设置成功';
    }
    // eslint-disable-next-line prefer-const
    let keyRecord = [];
    const keyRecordText = await ctx.model.KeyWordsText.find({});
    keyRecordText.forEach(item => {
      keyRecord.push(item.key);
    });
    // 每个关键字只能设置一种类型
    if (keyRecord.indexOf(key) !== -1) {
      ctx.error(2, '该关键字的回复类型已设置为text');
    }
    const newNewsReply = new ctx.model.KeyWordsNews({
      key,
      title,
      description,
      picUrl,
      url,
    });
    await newNewsReply.save();
    return '设置成功';
  }

  async delete() {
    // 删除关键字回复
    // 鉴权
    const { ctx } = this;
    const { type, id } = ctx.query;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    if (type === 'text') {
      const keyRecord = await ctx.model.KeyWordsText.findById(id);
      if (!keyRecord) {
        ctx.error(1, '未设置该关键字');
      }
      await ctx.model.KeyWordsText.deleteOne({ id });
      return '删除成功';
    }
    if (type === 'news') {
      const keyRecord = await ctx.model.KeyWordsNews.findById(id);
      if (!keyRecord) {
        ctx.error(1, '未设置该关键字');
      }
      await ctx.model.KeyWordsNews.deleteOne({ id });
      return '删除成功';
    }
  }
}

module.exports = wechatKey;
