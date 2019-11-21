'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const remindInfo = new Schema({
    troubleId: { type: String },
    createTime: { type: Number },
  });
  return mongoose.model('RemindInfo', remindInfo);
};
