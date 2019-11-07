'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const department = new Schema({
    name: { type: String }, // 部门名称
    delete: { type: Boolean, default: false }, // 是否标记删除
  });
  return mongoose.model('Department', department);
};
