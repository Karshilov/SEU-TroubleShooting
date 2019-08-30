'use strict'
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const UserSchema = new Schema({
        cardNum: { type: String },
        indentityType: { type: String },
        Institute: { type: String },
        name: { type: String },
        token: { type: String },
    });

    return mongoose.model('User', UserSchema);
}
