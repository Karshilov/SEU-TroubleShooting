<template>
  <div id="admin-view" class="page">
    <div>
      <div class="title">设置系统管理员</div>
      <div class="title-hint">系统管理员具有调整后台设置的权限，请谨慎设置</div>
      <div class="content">
        <el-form label-width="70px">
          <el-form-item label="一卡通号">
            <el-input v-model="cardnum"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="add">设置系统管理员</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">取消系统管理员</div>
      <div class="title-hint">取消系统管理员资格</div>
      <div class="content">
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="name" label="姓名"></el-table-column>
          <el-table-column label="操作" width="60">
            <template slot-scope="scope">
              <el-button @click="dialogVisible = true" type="text" size="small">删除</el-button>
              <el-dialog title="提示" :visible.sync="dialogVisible" width="90%" >
                <span>是否确定删除</span>
                <span slot="footer" class="dialog-footer">
                  <el-button @click="dialogVisible = false">取消</el-button>
                  <el-button type="primary" @click="deleteAdmin(scope.row.cardnum)">确定</el-button>
                </span>
              </el-dialog>
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
      cardnum: "",
      dialogVisible: false
    };
  },
  methods: {
    async add() {
      let res = await this.$axios.post(
        "/user/admin",
        { cardnum: this.cardnum },
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
      let res = await this.$axios.get("/user/admin", {
        headers: { token: this.token }
      });
      this.list = res.data.result;
    },
    async deleteAdmin(cardnum) {
      let res = await this.$axios.delete("/user/admin?cardnum=" + cardnum, {
        headers: { token: this.token }
      });
      if(res.data.success){
        this.$message({
          message: '删除成功',
          type: 'success'
        });
      } else {
        this.$message({
          message:`${res.err.errmsg}`,
          type: 'error'
        })
      }
      this.dialogVisible = false;
      this.load();
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