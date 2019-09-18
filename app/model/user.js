'use strict'
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const UserSchema = new Schema({
        cardnum: { type: String },
        indentityType: { type: String },
        Institute: { type: String },
        name: { type: String },
        openid: { type: String },
        token: { type: String },
        tokenExpireTime: { type: Number },
        tokenGetTime: { type: Number },
        phonenum: { type: String }
    });

    return mongoose.model('User', UserSchema);
}
