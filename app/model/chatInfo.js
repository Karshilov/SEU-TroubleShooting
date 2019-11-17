'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const chatInfo = new Schema({
    time: { type: Number }, // 时间
    fromWho: { type: String }, // 信息来源
    troubleId: { type: String }, // 故障信息ID
    content: { type: String }, // 聊天内容
  });

  return mongoose.model('ChatInfo', chatInfo);
}
;
