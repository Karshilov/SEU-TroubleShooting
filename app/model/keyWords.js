'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const keyWords = new Schema({
    key: { type: String }, // 关键字
    content: { type: String }, // 回复内容
  });
  return mongoose.model('KeyWords', keyWords);
};
