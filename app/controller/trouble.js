'use strict'
const moment = require('moment')
const Controller = require('egg').Controller;

const statusDisp = {
    'PENDING':'处理中',
    'DONE':'处理完成，等待验收',
    'ACCEPT':'故障已解决',
    'REJECT':'故障仍未解决',
    'CLOSED':'已关闭',
    'SPAM':'无效信息'
}

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
            departmentId,
            typeId,
            typeName:troubleType.displayName,
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
        let {ctx} = this
        let {statusFilter='PENDING', role, page=1, pagesize=10} = ctx.request.query
        page = +page
        pagesize = +pagesize

        if(role === 'USER'){
            // 用户查询的逻辑
            let record = await ctx.model.Trouble.find({
                userCardnum:ctx.userInfo.cardnum,
                status:statusFilter
            },['_id','createdTime','typeName'],{
                skip: pagesize * (page - 1),
                limit: pagesize,
                sort: { createdTime: -1 }
            })
            return record.map(r => {
                return {
                    ...r,
                    statusDisp:statusDisp[statusFilter]
                }
            })
        } else if(role === 'STAFF') {
            // 工作人员查询的逻辑
            let record = await ctx.model.Trouble.find({
                staffCardnum:ctx.userInfo.cardnum,
                status:statusFilter
            },['_id','createdTime','typeName'],{
                skip: pagesize * (page - 1),
                limit: pagesize,
                sort: { createdTime: -1 }
            })
            return record.map(r => {
                return {
                    ...r,
                    statusDisp:statusDisp[statusFilter]
                }
            })
        } else if(role === 'ADMIN') {
            // 管理员查询的逻辑
            let record = await ctx.model.Trouble.find({
                status:statusFilter
            },['_id','createdTime','typeName'],{
                skip: pagesize * (page - 1),
                limit: pagesize,
                sort: { createdTime: -1 }
            })
            return record.map(r => {
                return {
                    ...r,
                    statusDisp:statusDisp[statusFilter]
                }
            })
        } else {
            return []
        }
    }

    async detail() {
        // 查询故障信息
        let {ctx} = this
        let {troubleId} = ctx.query
        let cardnum = ctx.userInfo.cardnum
        let record = await ctx.model.Trouble.findById(troubleId)
        if(!record){
            ctx.error(1, '故障信息不存在')
        }
        // 只允许用户本人、故障处理人、管理员查看故障详细信息
        if(record.userCardnum !== cardnum && record.staffCardnum !== cardnum && !ctx.userInfo.isAdmin){
            ctx.permissionError('无权访问')
        }
        return {
            troubleId,
            typeName:record.typeName,
            createdTime:record.createdTime,
            desc:record.desc,
            image:record.image,
            statusDisp:statusDisp[record.status],
            canDeal:record.staffCardnum === cardnum,
            canCheck:record.status === 'DONE' && record.userCardnum === cardnum,
            dealTime:record.dealTime,
            departmentId:record.departmentId
        }
    }

    async deal() {
        // 工作人员标记故障处理完成
        // 查询故障信息
        let {ctx} = this
        let {troubleId} = ctx.request.body
        let cardnum = ctx.userInfo.cardnum
        let record = await ctx.model.Trouble.findById(troubleId)
        if(!record){
            ctx.error(1, '故障信息不存在')
        }
        // 只允许故障处理人将处于PENDING状态的故障标记为完成
        if(record.status !== 'PENDING' || record.staffCardnum !== cardnum){
            ctx.permissionError('无权操作')
        }
        record.status = 'DONE'
        record.dealTime = +moment()
        await record.save()
        // 向提交故障报修的用户推送处理完成
        await ctx.service.pushNotification.userNotification(
            record.userCardnum,
            '您报告的故障已处理完成',
            record.address,
            record.typeName, // type
            `处理完成`, // status
            moment().format('YYYY-MM-DD HH:mm:ss'), // lastModifiedTime
            '工作人员已经完成对故障的处理，请您及时检查处理结果并填写对本次服务的评价',
            `${this.config}/#/detail/${trouble._id}` // url - 故障详情页面
        )

    }

    async check() {
        // 用户验收故障处理结果
        // 查询故障信息
        let {ctx} = this
        let {troubleId, evaluation='未填写', evaluationLevel=5, accept} = ctx.request.body
        let cardnum = ctx.userInfo.cardnum
        let record = await ctx.model.Trouble.findById(troubleId)
        if(!record){
            ctx.error(1, '故障信息不存在')
        }
        // 只允许故障信息提交者将处于DONE状态
        if(record.status !== 'DONE' || record.userCardnum !== cardnum){
            ctx.permissionError('无权操作')
        }
        record.status = accept ? 'ACCEPT' : 'REJECT'
        record.checkTime = +moment()
        record.evaluation = evaluation
        record.evaluationLevel = evaluationLevel
        await record.save()
        return '评价成功！'
    }

    async redispatch() {

    }
}

module.exports = TroubleController;