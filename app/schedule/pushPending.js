'use strict';

const Subscription = require('egg').Subscription;
const moment = require('moment');
class PushPending extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '15m', // 15 分钟间隔
      type: 'worker', // 随机选取单一work执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const { ctx } = this;
    const now = +moment();
    let record = await ctx.model.Trouble.find({
      // status: "PENDING", createdTime: { $lt: now - 15 * 60 * 1000 }
      status: 'WAITING', createdTime: { $lt: now - 15 * 60 * 1000 }, // 15 * 60 * 1000
    }
    );
    record.forEach(async Element => {
      await ctx.service.pushNotification.staffNotification(
        Element.staffCardnum,
        `有超过${(Math.floor(Math.round((now - Element.createdTime) / (1000 * 60 * 60))) ?
          Math.floor(Math.round((now - Element.createdTime) / (1000 * 60 * 60))) + '小时' : '') + Math.round(((now - Element.createdTime) % (1000 * 60 * 60)) / (60 * 1000)) + '分钟'}未受理的故障信息！`,
        Element._id.toString().toUpperCase(), // code
        Element.typeName, // type
        '点击查看', // desc
        Element.phonenum,
        moment(Element.createdTime).format('YYYY-MM-DD HH:mm:ss'), // createdTime
        '故障描述信息：' + Element.desc,
        this.ctx.helper.oauthUrl(ctx, 'detail', Element._id) // url - 故障详情页面
      );
    }); // 向15分钟仍未处理完成的故障的负责工作人员发出信息

    record = await ctx.model.Trouble.find({
      status: 'WAITING', createdTime: { $lt: now - 30 * 60 * 1000 }, // 30 * 60 * 1000
    }
    );
    const adminList = await ctx.model.User.find({
      isAdmin: true,
    });

    // // 推送给管理员
    // record.forEach(async Element => {
    //   const luckyDog = ctx.helper.randomFromArray(adminList);
    //   const person = await ctx.model.User.findOne({ cardnum: Element.staffCardnum }); // 该故障负责人的信息
    //   await ctx.service.pushNotification.staffNotification(
    //     luckyDog.cardnum,
    //     `派发给${person.institute ? person.institute + '-' : ''}${person.name}的故障已经超过30分钟仍未处理`,
    //     Element._id.toString().toUpperCase(), // code
    //     Element.typeName, // type
    //     '点击查看', // desc
    //     Element.phonenum,
    //     moment(Element.createdTime).format('YYYY-MM-DD HH:mm:ss'), // createdTime
    //     '故障描述信息：' + Element.desc,
    //     this.ctx.helper.oauthUrl(ctx, 'detail', Element._id) // url - 故障详情页面
    //   );
    // });

    // 推送给部门管理员,在部门管理员没有设置的情况下推送给大管理员
    record.forEach(async Element => {
      const departmentAdmin = await ctx.model.DepartmentAdminBind.find({ departmentId: Element.departmentId });
      const person = await ctx.model.User.findOne({ cardnum: Element.staffCardnum }); // 该故障负责人的信息
      if (departmentAdmin.length !== 0) {
        // 有部门管理员，推送给部门管理员
        departmentAdmin.forEach(async admin => {
          await ctx.service.pushNotification.staffNotification(
            admin.adminCardnum,
            `派发给${person.institute ? person.institute + '-' : ''}${person.name}的故障已经超过${(Math.floor(Math.round((now - Element.createdTime) / (1000 * 60 * 60))) ?
              Math.floor(Math.round((now - Element.createdTime) / (1000 * 60 * 60))) + '小时' : '') + Math.round(((now - Element.createdTime) % (1000 * 60 * 60)) / (60 * 1000)) + '分钟'}仍未受理`,
            Element._id.toString().toUpperCase(), // code
            Element.typeName, // type
            '点击查看', // desc
            Element.phonenum,
            moment(Element.createdTime).format('YYYY-MM-DD HH:mm:ss'), // createdTime
            '故障描述信息：' + Element.desc,
            this.ctx.helper.oauthUrl(ctx, 'detail', Element._id) // url - 故障详情页面
          );
        });
      } else {
        // 没有部门管理员推送大管理员
        const luckyDog = ctx.helper.randomFromArray(adminList);
        const person = await ctx.model.User.findOne({ cardnum: Element.staffCardnum }); // 该故障负责人的信息
        await ctx.service.pushNotification.staffNotification(
          luckyDog.cardnum,
          `派发给${person.institute ? person.institute + '-' : ''}${person.name}的故障已经超过${(Math.floor(Math.round((now - Element.createdTime) / (1000 * 60 * 60))) ?
            Math.floor(Math.round((now - Element.createdTime) / (1000 * 60 * 60))) + '小时' : '') + Math.round(((now - Element.createdTime) % (1000 * 60 * 60)) / (60 * 1000)) + '分钟'}仍未受理`,
          Element._id.toString().toUpperCase(), // code
          Element.typeName, // type
          '点击查看', // desc
          Element.phonenum,
          moment(Element.createdTime).format('YYYY-MM-DD HH:mm:ss'), // createdTime
          '故障描述信息：' + Element.desc,
          this.ctx.helper.oauthUrl(ctx, 'detail', Element._id) // url - 故障详情页面
        );
      }
    });

  }
}

module.exports = PushPending;
