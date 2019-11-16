/* eslint-disable jsdoc/require-param */
'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const StatisticSchema = new Schema({
    timestamp: { type: Number },
    enterStatus: { type: String }, // 故障进入的状态
    troubleId: { type: String }, // 故障Id
    staffCardnum: { type: String }, // 操作运维人员一卡通
    typeId: { type: String }, // 故障类型名称
    departmentId: { type: String }, // 所属部门Id
  });

  return mongoose.model('Statistic', StatisticSchema);
};
