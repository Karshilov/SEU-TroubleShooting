'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  //中间件
  const checkSignature = app.middleware.checkSignature(app.config);
  const interceptorXML2json = app.middleware.interceptorXML2json();

  
  router.post('/', controller.home.index);
  router.get('/people/create', controller.test.create);
  router.get('/people/find', controller.test.find);


  router.get('/wechat', controller.wechat.checkSignature);
  router.post('/wechat', interceptorXML2json, checkSignature, controller.wechat.post);

  router.get('/wechatOauth',controller.wechatOauth.index);

  router.post('/user/bind',controller.user.bind);
  router.delete('/user/bind',controller.user.unbind);
  router.get('/user',controller.user.index);
  router.post('/user/admin',controller.user.setAdmin);
  router.delete('/user/admin',controller.user.deleteAdmin);

};
