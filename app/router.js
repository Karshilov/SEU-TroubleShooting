'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // 中间件
  const checkSignature = app.middleware.checkSignature(app.config);
  const interceptorXML2json = app.middleware.interceptorXML2json();

  router.post('/', controller.home.index);
  router.get('/people/create', controller.test.create);
  router.get('/people/find', controller.test.find);


  router.get('/wechat', controller.wechat.checkSignature);
  router.post('/wechat', interceptorXML2json, checkSignature, controller.wechat.post);

  router.get('/wechatOauth', controller.wechatOAuth.index);

  router.post('/user/bind', controller.user.bind);
  router.delete('/user/bind', controller.user.unbind);
  router.get('/user', controller.user.index);
  router.post('/user/admin', controller.user.setAdmin);
  router.delete('/user/admin', controller.user.deleteAdmin);
  router.get('/user/admin', controller.user.adminList);


  router.post('/type', controller.type.create);
  router.get('/type', controller.type.troubleList);
  router.delete('/type', controller.type.delete);

  router.post('/department', controller.department.createDepartment);
  router.get('/department', controller.department.listDepartment);
  router.delete('/department', controller.department.deleteDepartment);
  router.post('/department/staff', controller.department.bindStaff);
  router.get('/department/staff', controller.department.listStaff);
  router.delete('/department/staff', controller.department.unbindStaff);
  router.post('/department/admin', controller.department.setDepartmentAdmin);
  router.delete('/department/admin', controller.department.deleteDepartmentAdmin);
  router.get('/department/name', controller.department.listOneDepartment);

  router.get('/test', controller.test.notice);

  router.get('/jssdk', controller.jsSdkTicket.index);

  router.post('/trouble', controller.trouble.post);
  router.get('/trouble/list', controller.trouble.list);
  router.get('/trouble', controller.trouble.detail);
  router.post('/trouble/deal', controller.trouble.deal);
  router.post('/trouble/check', controller.trouble.check);
  router.post('/trouble/redirect', controller.trouble.redirect);

  router.post('/message', controller.message.createMessage);
  router.get('/message', controller.message.listMessage);

  router.get('/menu', controller.wechatMenu.get);
  router.post('/menu', controller.wechatMenu.add);
  router.post('/menu/exchange', controller.wechatMenu.exchange);
  router.delete('/menu', controller.wechatMenu.delete);
  router.post('/menu/push', controller.wechatMenu.push);

  router.post('/callback', controller.idsMinaCallback.callback);
  router.get('/idsCallback/:idsSession', controller.idsCASCallback.callback);
};
