'use strict';

module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const departmentAdminBind = new Schema({
    departmentId: { type: String }, // 部门ID
    departmentName: { type: String }, // 部门名称
    adminCardnum: { type: String }, // 管理员一卡通号
    name: { type: String }, // 用户姓名
  });
  return mongoose.model('DepartmentAdminBind', departmentAdminBind);
};
