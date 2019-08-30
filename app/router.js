'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);
  router.get('/people/create',controller.test.create);
  router.get('/people/find',controller.test.create);
};
