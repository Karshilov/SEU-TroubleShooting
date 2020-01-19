'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const keyWordsNews = new Schema({
    // 回复图文消息
    key: { type: String }, // 关键字
    title: { type: String }, // 标题
    description: { type: String }, // 描述
    picUrl: { type: String }, // 图片链接
    url: { type: String }, // 点击图文消息跳转链接
  });
  return mongoose.model('KeyWordsNews', keyWordsNews);
};
