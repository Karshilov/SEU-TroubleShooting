'use strict'

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const troubleType = new Schema({
        displayName:{type:String},  //故障类型名称
    });

    return mongoose.model('TroubleType', troubleType);
}