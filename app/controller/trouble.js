'use strict'
const moment = require('moment')
const Controller = require('egg').Controller;

class TroubleController extends Controller {
    async post() {
        // 故障报修
        let { ctx } = this
        let { typeId, desc, phoneNum, address, image } = ctx.request.body
        if (!ctx.userInfo.cardnum) {
            ctx.identityError('需要先绑定信息才能保修')
        }
        // 判断是否频率过高
        let userCardnum = ctx.userInfo.cardnum
        let now = +moment()
        let postCount = await ctx.model.Trouble.countDocuments({
            userCardnum,
            createdTime: { $gt: now - 24 * 60 * 60 * 1000 }
        })
        if (postCount > 5) {
            // 为了避免恶意骚扰，24小时内故障申报数量不能超过5个
            ctx.error(1, '故障申报频率过高，请稍后重试')
        }
        // 根据故障类型查找所属部门
        let troubleType = await ctx.model.TroubleType.findOne({
            _id: ctx.helper.ObjectId(typeId),
            delete: false
        })
        if (!troubleType) {
            ctx.error(2, '指定的故障类型不存在')
        }
        let departmentId = troubleType.departmentId
        // 获取部门员工列表
        let staffList = await ctx.model.StaffBind.find({departmentId})
        // 随机抽取一个幸运儿，把这个任务派给他
        let luckyDog = ctx.helper.randomFromArray(staffList)

        if(address){
            ctx.userInfo.address = address
            await ctx.userInfo.save()
        }

        address = ctx.userCardnum.address

        if(phoneNum){
            ctx.userInfo.phoneNum = phoneNum
            await ctx.userInfo.save()
        }

        phoneNum = ctx.userInfo.phoneNum

        let trouble = new ctx.model.Trouble({
            createdTime:now,
            desc,
            status:'PENDING', // 等待处理
            phoneNum,
            address,
            typeId,
            userCardnum,
            staffCardnum:luckyDog.cardnum
        })

        await trouble.save()

        // 向提交故障报修的用户推送正在处理通知
        await ctx.service.pushNotification.userNotification(
            userCardnum,
            '您申报的故障信息已被受理',
            address,
            troubleType.displayName, // type
            `正在等待工作人员（工号：${staffCardnum}）处理`, // status
            moment(now).format('YYYY-MM-DD HH:mm:ss'), // lastModifiedTime
            '工作人员已经收到您提交的故障信息，将尽快为您处理解决，期间请将您填写的联系方式保持畅通。',
            `${this.config}/#/detail/${trouble._id}` // url - 故障详情页面
        )
        // 向处理人员推送等待处理
        await ctx.service.pushNotification.staffNotification(
            luckyDog.cardnum,
            '有新的故障等待处理', // title
            trouble._id.toString().toUpperCase(), // code
            troubleType.displayName, // type
            '点击查看', // desc
            phoneNum,
            moment(now).format('YYYY-MM-DD HH:mm:ss'),
            '请尽快处理！',
            `${this.config}/#/detail/${trouble._id}`
        )
        return '提交成功'
    }

    async list() {
        
        // 查询故障列表
    }

    async detail() {
        // 查询故障信息
    }

    async deal() {
        // 工作人员标记故障处理完成
    }

    async check() {
        // 用户验收故障处理结果
    }
}

module.exports = TroubleController;