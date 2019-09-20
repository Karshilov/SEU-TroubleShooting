'use strict'

module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const trace = new Schema({
        redirectTime: { type: String },
        troubleId: { type: Number },
        toWho: { type: String }, //目标用户的ID
    });

    return mongoose.model('Trace', trace);
}