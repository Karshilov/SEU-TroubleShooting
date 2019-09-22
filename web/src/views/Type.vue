<template>
  <div id="type-view" class="page">
    <div>
      <div class="title">{{departmentName}}</div>
      <div class="title-hint">添加部门负责的故障类型</div>
      <div class="content">
        <el-form label-width="100px">
          <el-form-item label="故障类型名称">
            <el-input v-model="typeName" placeholder="该名称将显示给用户"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="add">添加</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">管理部门故障类型</div>
      <div class="title-hint">此处列出部门负责的所有故障类型</div>
      <div class="content">
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="displayName" label="故障类型名称"></el-table-column>
          <el-table-column label="操作" width="60">
            <template slot-scope="scope">
              <el-button @click="deleteType(scope.row._id)" type="text" size="small">删除</el-button>
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
      departmentName:'...',
      list: [],
      token: "",
      typeName: ""
    };
  },
  methods: {
    async add() {
      let res = await this.$axios.post(
        "/type",
        { typeName: this.typeName, departmentId: this.departmentId },
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
      let res = await this.$axios.get("/type?departmentId="+this.departmentId, {
        headers: { token: this.token }
      });
      this.list = res.data.result;
      res = await this.$axios.get("/department/name?departmentId="+this.departmentId)
      this.departmentName = res.data.result
    },
    async deleteType(typeId) {
      let res = await this.$axios.delete("/type?typeId="+typeId, {
        headers: { token: this.token }
      });
      this.load()
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.departmentId = this.$route.params.departmentId
    this.load();
  }
};
</script>

<style>
#type-view {
  margin-top: 30px;
}
</style>