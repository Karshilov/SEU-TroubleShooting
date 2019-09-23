'use strict'
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const troubleInfo = new Schema({
        createdTime: { type: Number }, //申报时间
        desc:{type: String}, //问题描述
        status:{type: String}, //故障状态
        evaluation:{type: String, default:''}, //用户评价
        evalationLevel:{type:Number, default:5}, //用户评级，默认好评
        phonenum:{type: String}, //联系电话
        address:{type: String, default:''},
        departmentId:{type: String}, // 故障所属部门ID
        typeId:{type: String}, //故障类型ID
        typeName:{type: String}, // 用于显示的故障类型名称
        staffCardnum:{type: String}, //维修人员一卡通号
        userCardnum:{type: String}, //用户一卡通号
        dealTime:{type:Number, default:0},
        checkTime:{type:Number, default:0},
        closedTime:{type:Number, default:0},
        image:{type:String, default:''}
    });

    return mongoose.model('TroubleInfo', troubleInfo);
}