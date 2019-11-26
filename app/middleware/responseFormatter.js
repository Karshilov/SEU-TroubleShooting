'use strict';

module.exports = () => {
  return async function responseFormatter(ctx, next) {
    if (ctx.request.url.indexOf('wechat') !== -1 || ctx.request.url.indexOf('ids') !== -1) {
      await next();
    } else if (ctx.request.url.indexOf('callback') !== -1) {
      try {
        const res = await next();
        ctx.response.status = 200;
        ctx.body = {
          result: res,
        };
      } catch (e) {
        ctx.response.status = 200;
        if (e.code) {
          // 存在 code 属性说明是自定义的错误
          ctx.body = {
            errcode: e.code,
            errmsg: e.message,
          };
        } else {
          // 不存在 code 说明是由于运行错误产生的属性
          ctx.body = {
            errcode: -1,
            errmsg: e.message,
          };
        }
      }
    } else {
      try {
        const res = await next();
        ctx.response.status = 200;
        ctx.body = {
          success: true,
          result: res,
        };
      } catch (e) {
        ctx.response.status = 200;
        if (e.code) {
          // 存在 code 属性说明是自定义的错误
          ctx.body = {
            success: false,
            errcode: e.code,
            errmsg: e.message,
          };
        } else {
          // 不存在 code 说明是由于运行错误产生的属性
          ctx.body = {
            success: false,
            errcode: -1,
            errmsg: e.message,
          };
        }
      }
    }
  };
}
;
