'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const seicToken = new Schema({
    token: { type: String }, // 微信报障平台 Token
    expiresTime: { type: Number }, // 东大服务台 Token 过期时间
  });
  return mongoose.model('seicToken', seicToken);
};

