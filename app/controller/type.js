'use strict';

const Controller = require('egg').Controller;

// 故障列表的顺序
const typeList = [ '四牌楼网络故障', '九龙湖网络故障', '丁家桥网络故障', '网站报修', '宿舍区网络报修', '其他保障', '信息系统保障' ];

class TypeController extends Controller {
  // 创建故障类型
  async create() {
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError();
    }

    const displayName = ctx.request.body.typeName;
    const resOfDisplayName = await ctx.model.TroubleType.findOne({ displayName, delete: false });
    if (resOfDisplayName) {
      ctx.error(1, '故障名称重复');
    }

    const id = ctx.request.body.departmentId;
    const Desc = ctx.request.body.typeDesc;
    // let Desc="这是一个故障描述"
    const resOfDepartmentId = await ctx.model.Department.findById(id);
    if (!resOfDepartmentId) {
      ctx.error(2, '部门ID不存在');
    }

    if (resOfDisplayName) {
      // 原来存在
      resOfDisplayName.displayName = displayName;
      resOfDisplayName.departmentId = id;
      resOfDisplayName.typeDesc = Desc;
      resOfDisplayName.delete = false;
      await resOfDisplayName.save();
    } else {
      // 原来没有
      const newTrouble = ctx.model.TroubleType({
        displayName,
        departmentId: id,
        typeDesc: Desc,
      });
      await newTrouble.save();
    }

  }
  // 删除故障类型
  async delete() {
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.identityError();
    }

    const id = ctx.query.typeId;
    const resOfTroubleId = await ctx.model.TroubleType.findById(id);
    if (!resOfTroubleId) {
      ctx.error(1, '故障类型不存在');
    }

    resOfTroubleId.delete = true;
    await resOfTroubleId.save();
  }
  // 获取故障类型列表
  async troubleList() {
    const { ctx } = this;
    const departmentId = ctx.query.departmentId;
    let resOfTrouble;
    if (departmentId) {
      resOfTrouble = await ctx.model.TroubleType.find({ delete: false, departmentId }, [ '_id', 'displayName', 'typeDesc' ]);
    } else {
      resOfTrouble = await ctx.model.TroubleType.find({ delete: false }, [ '_id', 'displayName', 'typeDesc' ]);
    }
    let resOfTroubleTidy;
    typeList.forEach(type => {
      console.log(type);
      resOfTrouble.forEach(res => {
        console.log(res);
        if (res.displayName === type) {
          resOfTroubleTidy.push(res);
        }
      });
    });

    return resOfTroubleTidy;
  }


}

module.exports = TypeController;
