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
  router.get('/user/admin',controller.user.adminList);


  router.post('/type',controller.type.create);
  router.get('/type',controller.type.troubleList);
  router.delete('/type',controller.type.delete);

  router.post('/department',controller.department.createDepartment);
  router.get('/department',controller.department.listDepartment);
  router.delete('/department',controller.department.deleteDepartment);
  router.post('/department/staff',controller.department.bindStaff);
  router.get('/department/staff',controller.department.listStaff);
  router.delete('/department/staff',controller.department.unbindStaff);
  router.get('/department/name',controller.department.listOneDepartment);

  router.get('/test',controller.test.notice);
  
  router.get('/jssdk',controller.jsSdkTicket.index)

  router.post('/trouble', controller.trouble.post)
  router.get('/trouble/list', controller.trouble.list)
  router.get('/trouble', controller.trouble.detail)
  router.post('/trouble/deal', controller.trouble.deal)
};
