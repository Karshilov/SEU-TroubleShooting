const mongoose = require('mongoose')

module.exports = {
    ObjectId:(id) => new mongoose.Types.ObjectId(id)
}