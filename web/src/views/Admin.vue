<template>
  <div id="admin-view" class="page">
    <div>
      <div class="title">设置管理员</div>
      <div class="title-hint">管理员具有调整后台设置的权限，请谨慎设置</div>
      <div class="content">
        <el-form label-width="70px">
          <el-form-item label="一卡通号">
            <el-input v-model="adminName"></el-input>
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
              <el-button @click="deleteadmin(scope.row.id)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      token: "",
      adminName: ""
    };
  },
  methods: {
    async add() {
      let res = await this.$axios.post(
        "/admin",
        { adminName: this.adminName },
        { headers: { token: this.token } }
      );
      if (res.data.success) {
        this.$message({ type: "success", message: "添加成功" });
        this.load();
      } else {
        this.$message.error(res.data.errmsg);
      }
    },
    async load() {
      let res = await this.$axios.get("/admin", {
        headers: { token: this.token }
      });
      this.list = res.data.result;
    },
    async deleteadmin(id) {
      let res = await this.$axios.delete("/admin?adminId="+id, {
        headers: { token: this.token }
      });
      this.load()
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.load();
  }
};
</script>

<style>
#admin-view {
  margin-top: 30px;
}
</style>