const moment = require('moment');
const sprintf = require('sprintf-js').sprintf;
const menu = require('./menu.json');


class AppBootHook {
  constructor(app) {
    this.app = app;


    app.once('server', server => {
      // websocket

    });
    app.on('error', (err, ctx) => {
      // report error
    });
    app.on('request', ctx => {
      // log receive request
      // 打印请求日志
      ctx.logger.info();
    });
    app.on('response', ctx => {

    });
  }


  async serverDidReady() {

    //获取access_token
    let access_token;
    let nowTime = moment().unix();  //当前时间
    //console.log(nowTime);
    let res = await this.app.model.Token.find({ startTime: { $lt: nowTime }, stopTime: { $gt: nowTime } });
    if (res.length) {
      console.log('使用缓存的access_token');
      access_token = res[0].accessToken;
    } else {
      console.log('重新请求access_token');
      let url = sprintf('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=%s&secret=%s', this.config.wechat.appID, this.config.wechat.appsecret);
      let result = await this.ctx.curl(url, {
        dataType: 'json'
      })
      let now = moment().unix();
      let newToken = this.app.model.Token({
        accessToken: result.data.access_token,
        expiresIn: result.data.expires_in,
        startTime: now,
        stopTime: now + result.data.expires_in
      })
      await newToken.save();
      access_token = result.data.access_token;
    }
    //自定义菜单
    let url = sprintf('https://api.weixin.qq.com/cgi-bin/menu/create?access_token=%s',access_token);
    let result = await this.app.curl(url,{
      method: 'POST',
      contentType: 'json',
      data: menu ,
      dataType: 'json',
    })

    if(result.data.errcode === 0){
      console.log('自定义菜单创建成功');
    }else{
      console.log('自定义菜单创建失败');
    }

  }



}

module.exports = AppBootHook;
