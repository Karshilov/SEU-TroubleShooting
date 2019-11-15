'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const troubleType = new Schema({
    displayName: { type: String }, // 故障类型名称
    delete: { type: Boolean, default: false }, // 标记是否删除
    departmentId: { type: String }, // 故障所属部门ID
    typeDesc: { type: String },
  });

  return mongoose.model('TroubleType', troubleType);
}
;
