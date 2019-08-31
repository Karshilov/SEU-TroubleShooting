'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    
    console.log('sas');
  }
}

module.exports = HomeController;
