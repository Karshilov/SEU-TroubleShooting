const mongoose = require('mongoose')

module.exports = {
    ObjectId:(id) => mongoose.Types.ObjectId(id)
}