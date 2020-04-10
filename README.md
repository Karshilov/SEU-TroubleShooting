# SEU-TroubleShooting

东南大学网络与信息中心故障报修平台

## 调试URL入口

https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxddf0c7e0b5167c36&redirect_uri=https://seicwxbz.seu.edu.cn/api/wechatOauth&response_type=code&scope=snsapi_base&state=list_USER#wechat_redirect

## 吃瓜日志
```tail -f /root/logs/seu-nic-trouble-shooting/seu-nic-trouble-shooting-web.log | grep --line-buffer text > ~/wechat-message.log &```