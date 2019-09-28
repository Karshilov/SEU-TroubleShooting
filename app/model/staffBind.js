'use strict'

module.exports = app =>{
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const staffBind = new Schema({
        departmentId:{type:String},  //部门ID
        departmentName:{type:String},  //部门名称
        staffCardnum:{type:String}, // 是否标记删除
        name:{type:String} // 用户姓名
    });
    return mongoose.model('StaffBind',staffBind);
}