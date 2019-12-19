'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const wiseduToken = new Schema({
    token: { type: String }, // 东大服务台 Token
    expireTime: { type: Number }, // 东大服务台 Token 过期时间
  });
  return mongoose.model('WiseduToken', wiseduToken);
};

