<template>
  <div id="department-view" class="page">
    <div>
      <div class="title">添加部门</div>
      <div class="title-hint">部门是组织人员和故障类型的实体，用户报告的故障信息会被汇聚到部门中，然后自动派发给部门的成员</div>
      <div class="content">
        <el-form label-width="70px">
          <el-form-item label="部门名称">
            <el-input v-model="departmentName"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="add">添加</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">管理部门设置</div>
      <div class="title-hint">修改部门负责的故障类型和部门管理的人员信息</div>
      <div class="content">
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="name" label="部门名称"></el-table-column>
          <el-table-column label="操作" width="180">
            <template slot-scope="scope">
              <el-button @click="editStaff(scope.row.id)" type="text" size="small">人员管理</el-button>
              <el-button @click="editType(scope.row.id)" type="text" size="small">故障类型</el-button>
              <el-button @click="openDialog(scope.row.id)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="90%" >
      <span>是否确定删除</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteDepartment">确定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      token: "",
      departmentName: "",
      dialogVisible: false,
      deleteTarget: ""
    };
  },
  methods: {
    async add() {
      let res = await this.$axios.post(
        "/department",
        { departmentName: this.departmentName },
        { headers: { token: this.token } }
      );
      if (res.data.success) {
        this.$message({ type: "success", message: "添加成功" });
        this.departmentName="";
        this.load();
      } else {
        this.$message.error(res.data.errmsg);
      }
    },
    async load() {
      let res = await this.$axios.get("/department", {
        headers: { token: this.token }
      });
      this.list = res.data.result;
    },
    async deleteDepartment() {
      const res = await this.$axios.delete("/department?departmentId="+this.deleteTarget, {
        headers: { token: this.token }
      });
      if(res.data.success){
        this.$message({
          message: '删除成功',
          type: 'success'
        });
      }else{
        this.$message({
          message: '删除错误',
          type: 'error'
        });
      }
      this.dialogVisible = false;
      this.load();
    },
    editType(id){
      this.$router.push(`/type/${this.token}/${id}`)
    },
    editStaff(id){
      this.$router.push(`/staff/${this.token}/${id}`)
    },
    openDialog(id){
      this.deleteTarget = id;
      this.dialogVisible = true;
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.load();
  }
};
</script>

<style>
#department-view {
  margin-top: 30px;
}
</style>