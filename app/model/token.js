'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const TokenSchema = new Schema({
    accessToken: { type: String },
    expiresIn: { type: Number }, // 获取有效时间
    startTime: { type: Number }, // 起始时间
    stopTime: { type: Number }, // 终止时间
  });

  return mongoose.model('Token', TokenSchema);
};

