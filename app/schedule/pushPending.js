const Subscription = require('egg').Subscription;
const moment =require('moment')
class PushPending extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '15m', // 1 分钟间隔
      type: 'worker', // 随机选取单一work执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    let { ctx } = this;
    let now = +moment()
    let record = await ctx.model.Trouble.find({
      // status: "PENDING", createdTime: { $lt: now - 15 * 60 * 1000 }
      status: "PENDING", createdTime: { $lt: now - 1 * 60 * 15000 }
    }
    );
    record.forEach(async Element =>{
      await ctx.service.pushNotification.staffNotification(
        Element.staffCardnum,
        '有超过15分钟未处理的故障信息！',
        Element._id.toString().toUpperCase(), // code
        Element.typeName, // type
        `点击查看`, // desc
        Element.phonenum,
        moment(Element.createdTime).format('YYYY-MM-DD HH:mm:ss'), // createdTime
        '故障描述信息：'+Element.desc,
        this.ctx.helper.oauthUrl(ctx, 'detail', Element._id) // url - 故障详情页面
      )
    }) // 向15分钟仍未处理完成的故障的负责工作人员发出信息
    
    record = await ctx.model.Trouble.find({
      status: "PENDING", createdTime: { $lt: now - 30 * 60 * 1000 }
    }
    );
    let adminList = await ctx.model.User.find({
      isAdmin:true
    })
    record.forEach(async Element => {
      let luckyDog = ctx.helper.randomFromArray(adminList)
      await ctx.service.pushNotification.staffNotification(
        luckyDog.cardnum,
        `派发给${Element.staffCardnum}的故障已经超过30分钟仍未处理`,
        Element._id.toString().toUpperCase(), // code
        Element.typeName, // type
        `点击查看`, // desc
        Element.phonenum,
        moment(Element.createdTime).format('YYYY-MM-DD HH:mm:ss'), // createdTime
        '故障描述信息：'+Element.desc,
        this.ctx.helper.oauthUrl(ctx, 'detail', Element._id) // url - 故障详情页面
      )
    })

  }
}

module.exports = PushPending;