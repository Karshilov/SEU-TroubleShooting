'use strict'

const sha1 = require('sha1');

module.exports = options =>{
    return async function checkSignature(ctx, next){
        //判断是否为微信服务器的请求
        let signature = ctx.request.query.signature;
        let timestamp = ctx.request.query.timestamp;
        let nonce = ctx.request.query.nonce;
        let token = options.wechat.token;
        let array = [token, nonce, timestamp].sort();

        if (signature === sha1(array[0] + array[1] + array[2])){
            console.log('来自微信后的请求，接受请求');
            await next();
        } 
        else{
            console.log('不是来自微信平台的请求，拒绝请求');
            ctx.response.body = 'qnmd';
        }

    }
}