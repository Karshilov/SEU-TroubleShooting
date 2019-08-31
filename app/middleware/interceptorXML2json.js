'use strict'
const getRawBody = require("raw-body");
const xmlparser = require('xml2json');


module.exports = options => {
    return async function interceptorXML2json(ctx,next) {
		//拦截request请求
		
		try{
			//把xml转成json
			if(ctx.request.header["content-type"] === 'text/xml'){
				let buff = await getRawBody(ctx.request.req);
				let resultjson = JSON.parse(xmlparser.toJson(buff)).xml;
				ctx.request.body = resultjson;
			} else {
				//入参处理
				let reqJson = ctx.request.body.json;
				//入参重新赋值
				ctx.request.body = JSON.parse(reqJson);
			}

		} catch (e) {
			ctx.response.body = errorModule.JSON_PARSE_ERR;
			return;
		}

		//返回控制权给控制器
		await next();
    };
};
