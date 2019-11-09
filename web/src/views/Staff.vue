<template>
  <div id="type-view" class="page">
    <div>
      <div class="title">{{departmentName}}</div>
      <div class="title-hint">添加部门员工以及设置部门管理员，只有添加到该部门的员工才能处理部门分管的故障</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="一卡通号">
            <el-input v-model="cardnum" placeholder="员工的一卡通号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="add">添加</el-button>
            <el-button type="primary" @click="setAdmin">设置部门管理员</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">设置部门管理员</div>
      <div class="title-hint">此处列出该部门的管理员，每个部门仅设置一名管理员</div>
      <div class="content">
        <el-table :data="adminList" style="width: 100%">
          <el-table-column prop="name" label="姓名"></el-table-column>
          <el-table-column prop="adminCardnum" label="一卡通号"></el-table-column>
          <el-table-column label="操作" width="60">
            <template >
              <el-button @click="deleteAdmin()" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">管理部门员工</div>
      <div class="title-hint">此处列出部门所有员工</div>
      <div class="content">
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="name" label="姓名"></el-table-column>
          <el-table-column prop="staffCardnum" label="一卡通号"></el-table-column>
          <el-table-column label="操作" width="60">
            <template slot-scope="scope">
              <el-button @click="deleteStaff(scope.row.staffCardnum)" type="text" size="small">删除</el-button>
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
      departmentName: "...",
      list: [],
      adminList: [],
      token: "",
      cardnum: ""
    };
  },
  methods: {
    async add() {
      let res = await this.$axios.post(
        "/department/staff",
        { departmentId: this.departmentId, staffCardnum: this.cardnum },
        { headers: { token: this.token } }
      );
      if (res.data.success) {
        this.$message({ type: "success", message: "添加成功" });
        this.load();
      } else {
        this.$message.error(res.data.errmsg);
      }
    },
    async setAdmin() {
      let res = await this.$axios.post(
        "/department/admin",
        { departmentId: this.departmentId, adminCardnum: this.cardnumm },
        { headers: { token: this.token } }
      );
      if (res.data.success) {
        this.$message({ type: "success", message: "设置成功" });
        this.load();
      } else {
        this.$message.error(res.data.errmsg);
      }
    },
    async load() {
      let res = await this.$axios.get(
        "/department/staff?departmentId=" + this.departmentId,
        {
          headers: { token: this.token }
        }
      );
      this.list = res.data.result;
      res = await this.$axios.get(
        "/department/name?departmentId=" + this.departmentId
      );
      this.departmentName = res.data.result;
      res = await this.$axios.get(
        "/department/admin?departmentId=" + this.departmentId
      );
      this.adminList = res.data.result;
    },
    async deleteStaff(staffCardnum) {
      await this.$axios.delete(
        "/department/staff?staffCardnum=" +
          staffCardnum +
          "&departmentId=" +
          this.departmentId,
        {
          headers: { token: this.token }
        }
      );
      this.load();
    },
    async deleteAdmin() {
      await this.$axios.delete(
        "/department/admin?departmentId=" + this.departmentId,
        {
          headers: { token: this.token }
        }
      );
      this.load();
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.departmentId = this.$route.params.departmentId;
    this.load();
  }
};
</script>

<style>
#type-view {
  margin-top: 30px;
}
</style>