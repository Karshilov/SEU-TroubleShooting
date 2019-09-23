'use strict'
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const JsApiTicketSchema = new Schema({
        jsApiTicket: {type: String},
        expiresTime:{type: Number}   //过期时间
    });

    return mongoose.model('JsApiTicket', JsApiTicketSchema);
}

