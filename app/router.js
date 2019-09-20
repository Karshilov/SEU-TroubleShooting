'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  //中间件（此处有赵拯基一次阿鲁巴）
  const checkSignature = app.middleware.checkSignature(app.config);
  const interceptorXML2json = app.middleware.interceptorXML2json();
  
  router.post('/', controller.home.index);
  router.get('/people/create', controller.test.create);
  router.get('/people/find', controller.test.find);


  router.get('/wechat', controller.wechat.checkSignature);
  router.post('/wechat', interceptorXML2json, checkSignature, controller.wechat.post);

  router.get('/wechat-oauth',controller.wxOauth.index);
};
