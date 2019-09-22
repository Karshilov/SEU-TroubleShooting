const Controller = require('egg').Controller;

class TypeController extends Controller {
    //创建故障类型
    async create() {
        const { ctx } = this;
        if (!ctx.userInfo.isAdmin) {
            ctx.permissionError();
        }

        let displayName = ctx.request.body.typeName;
        let resOfDisplayName = await ctx.model.TroubleType.findOne({ displayName, delete: false });
        if (resOfDisplayName) {
            ctx.error(1, '故障名称重复');
        }

        let id = ctx.request.body.departmentId;
        let resOfDepartmentId = await ctx.model.Department.findById(id);
        if (!resOfDepartmentId) {
            ctx.error(2, '部门ID不存在');
        }

        if (resOfDisplayName) {
            //原来存在
            resOfDisplayName.displayName = displayName;
            resOfDisplayName.departmentId = id;
            resOfDisplayName.delete = false;
            await resOfDisplayName.save();
        } else {
            //原来没有
            let newTrouble = ctx.model.TroubleType({
                displayName: displayName,
                departmentId: id
            });
            await newTrouble.save();
        }

    }
    //删除故障类型
    async delete() {
        const { ctx } = this;
        if (!ctx.userInfo.isAdmin) {
            ctx.identityError();
        }

        let id = ctx.query.typeId;
        let resOfTroubleId = await ctx.model.TroubleType.findById(id);
        if (!resOfTroubleId) {
            ctx.error(1, '故障类型不存在');
        }

        resOfTroubleId.delete = true;
        await resOfTroubleId.save();
    }
    //获取故障类型列表
    async troubleList() {
        const { ctx } = this;
        let departmentId = ctx.query.departmentId;
        let resOfTrouble = await ctx.model.TroubleType.find({ delete: false, departmentId }, ['_id', 'displayName']);
        return resOfTrouble;
    }


}

module.exports = TypeController;