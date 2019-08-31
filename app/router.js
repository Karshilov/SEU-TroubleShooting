'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  //test
  router.get('/', controller.home.index);
  router.get('/people/create',controller.test.create);
  router.get('/people/find',controller.test.find);


  router.get('/wechat',controller.wechat.checkSignature);
  router.get('/token',controller.test.testGetaccessToken);
};
