'use strict';

const Controller = require('egg').Controller;

class DepartmentController extends Controller {
  async createDepartment() {
    const { ctx } = this;
    // 验证权限
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('只允许管理员操作部门设置');
    }
    // 获取部门权限
    const departmentName = ctx.request.body.departmentName;
    if (!departmentName) {
      ctx.paramsError('未指定新建部门名称');
    }
    // 检查部门名称是否重复
    const departmentNameCount = await ctx.model.Department.countDocuments({ name: departmentName, delete: false });
    if (departmentNameCount !== 0) {
      ctx.error(1, '已存在相同名称的部门，请更换一个新的部门名称');
    }
    // 检查通过，创建新的部门
    const department = new ctx.model.Department({ name: departmentName });
    await department.save();
    return '创建成功';
  }

  async listDepartment() {
    // 列出所有部门
    const { ctx } = this;
    const departmentList = await ctx.model.Department.find({ delete: false });
    return departmentList.map(k => { return { id: k._id, name: k.name }; });
  }

  async setDepartmentAdmin() {
    const { ctx } = this;
    const { departmentId, adminCardnum } = ctx.request.body;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('只允许管理员操作');
    }

    const resOfCardnum = await ctx.model.User.findOne({ cardnum: adminCardnum });
    if (!resOfCardnum) {
      ctx.permissionError('目标用户不存在');
    }

    // eslint-disable-next-line prefer-const
    let resOfDepartmentId = await ctx.model.DepartmentAdminBind.findOne({ departmentId });
    if (!resOfDepartmentId) {
      // 该部门没有绑定管理员
      const newDepartmentAdmin = new ctx.model.DepartmentAdminBind({
        departmentId,
        adminCardnum: resOfCardnum.cardnum,
        name: resOfCardnum.name,
      });
      await newDepartmentAdmin.save();
    } else {
      // 该部门已经绑定管理员，更新管理员信息
      resOfDepartmentId.adminCardnum = resOfCardnum.cardnum;
      resOfDepartmentId.name = resOfCardnum.name;
      await resOfDepartmentId.save();
    }
    return '设置部门管理员成功';
  }

  async deleteDepartmentAdmin() {
    const { ctx } = this;
    const { departmentId } = ctx.query;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('只允许管理员操作');
    }
    if (!departmentId) {
      ctx.paramsError('未指定删除管理员的部门');
    }
    await ctx.model.DepartmentAdminBind.deleteOne({ departmentId });

    return '删除部门管理员成功';
  }

  async getDepartmentAdmin() {
    const { ctx } = this;
    const { departmentId } = ctx.query;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('只允许管理员操作');
    }
    if (!departmentId) {
      ctx.paramsError('未指定查询部门');
    }
    return ctx.model.DepartmentAdminBind.find({ departmentId });

  }

  async bindStaff() {
    const { ctx } = this;
    // 验证权限
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('只允许管理员操作部门人员');
    }
    const { staffCardnum, departmentId } = ctx.request.body;
    if (!staffCardnum || !departmentId) {
      ctx.paramsError();
    }
    // 检查department是否存在
    const department = await ctx.model.Department.findOne({ _id: ctx.helper.ObjectId(departmentId), delete: false });
    if (!department) {
      ctx.error(1, '指定的部门不存在');
    }
    // 检查是否重复绑定
    const count = await ctx.model.StaffBind.countDocuments({ departmentId, staffCardnum });
    if (count > 0) {
      ctx.error(2, '该员工已绑定，请勿重复绑定');
    }
    // 检查一卡通对应的人员是否存在
    const userRecord = await ctx.model.User.findOne({ cardnum: staffCardnum });
    if (!userRecord) {
      ctx.error(3, '指定的人员不存在');
    }
    // 绑定新员工
    const staffBind = new ctx.model.StaffBind({ departmentName: department.name, departmentId, staffCardnum, name: userRecord.name });
    await staffBind.save();
    return '绑定成功！';
  }

  async unbindStaff() {
    const { ctx } = this;
    // 验证权限
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('只允许管理员操作部门人员');
    }
    const { staffCardnum, departmentId } = ctx.query;
    if (!staffCardnum || !departmentId) {
      ctx.paramsError();
    }
    // 检查是否已绑定
    const count = await ctx.model.StaffBind.countDocuments({ departmentId, staffCardnum });
    if (count === 0) {
      ctx.error(1, '未绑定该员工');
    }
    // 解除绑定
    await ctx.model.StaffBind.deleteMany({ departmentId, staffCardnum });
    return '绑定成功！';
  }

  async listStaff() {
    const { ctx } = this;
    const { departmentId } = ctx.query;
    const isStaff = await ctx.model.StaffBind.countDocuments({ staffCardnum: ctx.userInfo.cardnum });
    if (!ctx.userInfo.isAdmin && !isStaff) {
      ctx.permissionError('无权访问');
    }
    let record;
    if (departmentId) {
      record = await ctx.model.StaffBind.find({ departmentId }, 'departmentName departmentId staffCardnum name');
    } else {
      record = await ctx.model.StaffBind.find({}, 'departmentName departmentId staffCardnum name');
      record = record.map(r => {
        r.name = `${r.name}(${r.departmentName})`;
        return r;
      });
    }
    return record;
  }

  async deleteDepartment() {
    const { ctx } = this;
    if (!ctx.userInfo.isAdmin) {
      ctx.permissionError('无权操作');
    }
    const { departmentId } = ctx.query;
    if (!departmentId) {
      ctx.paramsError('未指定要删除的部门');
    }
    // 将部门标记为删除
    await ctx.model.Department.updateOne({ _id: ctx.helper.ObjectId(departmentId) }, { $set: { delete: true } });
    // 解除部门和员工的绑定
    await ctx.model.StaffBind.deleteMany({ departmentId });
    // 将部门下的故障处理类型标记删除
    await ctx.model.TroubleType.updateMany({ departmentId }, { $set: { delete: true } });
    return '部门删除成功';
  }

  async listOneDepartment() {
    const { ctx } = this;
    const id = ctx.query.departmentId;
    const resOfDepartmentId = await ctx.model.Department.findById(id);

    if (!resOfDepartmentId) {
      ctx.error(-4, '没有查询到部门名称');
    }

    return resOfDepartmentId.name;
  }

}

module.exports = DepartmentController;
