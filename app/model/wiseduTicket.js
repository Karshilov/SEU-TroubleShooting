'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const wiseduTicket = new Schema({
    token: { type: String }, // 给金智的 Token
    expireTime: { type: Number }, // 过期时间
  });
  return mongoose.model('WiseduTicket', wiseduTicket);
};
