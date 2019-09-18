'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  //中间键
  const checkSignature = app.middleware.checkSignature(app.config);
  const interceptorXML2json = app.middleware.interceptorXML2json();
  const identity = app.middleware.identity({});
  const keyword = app.middleware.keyword();
  //test
  router.post('/', controller.home.index);
  router.get('/people/create', controller.test.create);
  router.get('/people/find', controller.test.find);


  router.get('/wechat', controller.wechat.checkSignature);
  router.post('/wechat', interceptorXML2json, checkSignature, controller.wechat.post);

  router.get('/wx-oauth',controller.wxOauth.index);
};
