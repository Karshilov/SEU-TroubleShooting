const mongoose = require('mongoose')

module.exports = {
    ObjectId:(id) => mongoose.Types.ObjectId(id),
    randomFromArray(arr){
        return arr[Math.floor((Math.random()*arr.length))]
    }
}