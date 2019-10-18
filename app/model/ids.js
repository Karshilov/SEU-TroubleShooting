'use strict'

module.exports = app =>{
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const ids = new Schema({
        idsSession:{type:String},  // 用于和统一身份认证小程序对接的ids_session
        openId:{type:String}, // 记录当前发起认证用户的OpenId
        target:{type:String} // 记录发起认证的目标动作
    });
    return mongoose.model('IDS', ids);
}