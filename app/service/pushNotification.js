'use strict'
const Service = require('egg').Service
const moment = require('moment')

class pushNotification extends Service {
    async userNotification(cardnum, title, address, type, status, lastModifiedTime, remark, url) {

    }

    async staffNotification(cardnum, title, code, type, desc, phoneNum, createdTime, remark, url){

    }
}

module.exports = pushNotification;