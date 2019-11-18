'use strict';
const mongoose = require('mongoose');

module.exports = {
  ObjectId: id => mongoose.Types.ObjectId(id),
  randomFromArray(arr) {
    return arr[Math.floor((Math.random() * arr.length))];
  },
  oauthUrl(ctx, after, afterArgs) {
    return `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ctx.app.config.wechat.appID}&redirect_uri=${ctx.app.config.serverURL}wechatOauth&response_type=code&scope=snsapi_base&state=${after}${afterArgs ? '_' + afterArgs : ''}#wechat_redirect`;
  },
  timeDifference(before, now) {
    const hour = 60 * 60 * 1000;
    const minute = 60 * 1000;
    const hourReturn = Math.floor((now - before) / hour);
    const minuteReturn = Math.round((now - before - hourReturn * hour) / minute);
    return (hourReturn === 0 ? '' : hourReturn + '小时') + minuteReturn + '分钟';
  },
};
