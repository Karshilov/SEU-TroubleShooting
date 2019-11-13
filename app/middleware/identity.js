'use strict';
const moment = require('moment');

module.exports = () => {
  return async function identity(ctx, next) {

    const token = ctx.request.headers.token;
    const record = token ? await ctx.model.User.findOne({ token }) : false;
    if (record && record.tokenExpireTime > +moment()) {
      ctx.userInfo = record;
    } else {
      Object.defineProperty(ctx, 'userInfo', {
        get: () => {
          ctx.identityError();
        },
      });

    }
    return await next();

  };
};

