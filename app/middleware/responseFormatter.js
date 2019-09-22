'use strict'

module.exports = () =>{
    return async function responseFormatter(ctx, next){
        if(ctx.request.url.indexOf('wechat') !== -1){
            await next()
        } else {
            try {
                let res = await next()
                ctx.response.status = 200
                ctx.body = {
                    success:true,
                    result:res
                }
            } catch (e) {
                ctx.response.status = 200
                if(e.code){
                    // 存在 code 属性说明是自定义的错误
                    ctx.body = {
                        success:false,
                        errcode:e.code,
                        errmsg:e.message
                    }
                } else {
                    // 不存在 code 说明是由于运行错误产生的属性
                    ctx.body = {
                        success:false,
                        errcode:-1,
                        errmsg:e.message
                    }
                }
            }
        }
    }
}