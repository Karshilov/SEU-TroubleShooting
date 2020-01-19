'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const keyWordsText = new Schema({
    // 回复文本消息
    key: { type: String }, // 关键字
    content: { type: String }, // 回复内容
  });
  return mongoose.model('KeyWordsText', keyWordsText);
};
