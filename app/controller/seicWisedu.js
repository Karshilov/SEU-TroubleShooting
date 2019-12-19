'use strict';

const Controller = require('egg').Controller;
const sha1 = require('sha1');
// const moment = require('moment');


class wiseduController extends Controller {
  async getToken() {
    const { ctx } = this;
  }
}

module.exports = wiseduController;
