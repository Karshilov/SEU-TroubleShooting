'use strict'
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const InfoSchema = new Schema({
        reportTime: { type: String },
        reporterName: { type: String },
        reporterCardNum: { type: String },
        reporterPhoneNum: { type: String },
        reporterQQNum: { type: String },
        description: { type: String },
        classification1: { type: Number },
        classification2: { type: Number },
        status: { type: Number },
        workerCardnum: { type: String },
        evaluation: { type: String },
    });

    return mongoose.model('Info', InfoSchema);
}