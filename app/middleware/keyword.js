'use strict'

const moment = require('moment');

module.exports = options =>{
    return async function keyword(ctx,next){
        console.log('关键字');
        let keyword = ctx.request.body.Content;
        if(keyword === '添加人员'){
            ctx.response.body =
                `
                <xml>
                    <ToUserName><![CDATA[${ctx.request.body.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${ctx.request.body.ToUserName}]]></FromUserName>
                    <CreateTime>${moment().unix()}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[<a href="http://47.106.227.224:3435/">添加人员</a>]]></Content>
                </xml>
                `
        }else if(keyword === '删除人员'){

        }else if(keyword === '修改人员信息'){

        }else if(keyword === '查看报修故障统计'){

        }else{

        }
        // console.log(ctx.request.body.Institute);
        // console.log(ctx.request.body.indentityType);
    }
}