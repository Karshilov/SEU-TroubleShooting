'use strict';

const Subscription = require('egg').Subscription;
const moment = require('moment');
class AutoComplete extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1m', // 1 分钟间隔
      type: 'worker', // 随机选取单一work执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx } = this;
    const now = +moment();
    let record = await ctx.model.Trouble.find({
      status: 'DONE', dealTime: { $lt: now - 3 * 24 * 60 * 60 * 1000 }, // 3 * 24 * 60 * 60 * 1000
    }
    );
    record.forEach(async Element => {
        Element.status = 'ACCEPT';
        Element.checkTime = +moment();
        Element.evaluation = '用户未填写意见建议';
        record.evaluationLevel = 5;
    }); // 向15分钟仍未处理完成的故障的负责工作人员发出信息
    await record.save();
  }
}

module.exports = AutoComplete;
