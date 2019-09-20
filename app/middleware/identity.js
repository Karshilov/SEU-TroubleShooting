'use strict'
const moment = require('moment');

module.exports = options => {
    return async function identity(ctx, next) {
        let token = ctx.request.headers.token
        let record = token ? await ctx.model.User.findOne({ token }) : false
        if(record){
            ctx.userInfo = record
        } else {
            Object.defineProperty(ctx, 'userInfo', {get:()=>{
                ctx.identityError()
            }})
        }
        await next()
        
    }
}