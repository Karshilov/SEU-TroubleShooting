'use strict'
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const troubleInfo = new Schema({
        reportTime: { type: Number }, //申报时间
        description:{type: String}, //问题描述
        status:{type: Number}, //故障状态
        evaluation:{type: String}, //用户评价
        phonenum:{type: String}, //联系电话
        qqnum:{type: String}, //qq号
        typeId:{type: String}, //故障类型
        workerId:{type: String}, //维修人员ID
        name:{type: String}, //用户姓名
        userId:{type: String} //用户ID
    });

    return mongoose.model('TroubleInfo', troubleInfo);
}