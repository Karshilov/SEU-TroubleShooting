'use strict'
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const UserSchema = new Schema({
        cardnum: { type: String, default: '' },
        institute: { type: String, default: '' },
        name: { type: String, default: '' },
        openid: { type: String },
        token: { type: String },
        tokenExpireTime: { type: Number, default: 0 },
        phonenum: { type: String, default: '' },
        isAdmin: { type: Boolean, default: false },
        isWorker: { type: Boolean, default: false },
        address: { type: String, default: '' }
    });

    return mongoose.model('User', UserSchema);
}
