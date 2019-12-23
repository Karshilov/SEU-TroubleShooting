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
          <el-form-item label="故障类型描述">
            <el-input v-model="typeDesc" type="textarea" placeholder="该描述将显示给用户"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="add">添加</el-button>
            <el-button type="primary" @click="addInternal">添加为内部类型</el-button>
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
              <el-button @click="openDialog(scope.row._id)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-dialog title="提示" :visible.sync="dialogVisible" width="90%" >
          <span>是否确定删除</span>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="deleteType">确定</el-button>
          </span>
        </el-dialog>
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
      typeName: "",
      typeDesc: "",
      dialogVisible: false,
      deleteTarget: ""
    };
  },
  methods: {
    async add() {
      let res = await this.$axios.post(
        "/type",
        { typeName: this.typeName, departmentId: this.departmentId ,typeDesc:this.typeDesc},
        { headers: { token: this.token } }
      );
      if (res.data.success) {
        this.$message({ type: "success", message: "添加成功" });
        this.typeName="";
        this.typeDesc="";
        this.load();
      } else {
        this.$message.error(res.data.errmsg);
      }
    },
    async addInternal() {
      let res = await this.$axios.post(
        "/type",
        { typeName: this.typeName, departmentId: this.departmentId ,typeDesc:this.typeDesc, isInternal: true},
        { headers: { token: this.token } }
      );
      if (res.data.success) {
        this.$message({ type: "success", message: "添加成功" });
        this.typeName="";
        this.typeDesc="";
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
    async deleteType() {
      let res = await this.$axios.delete("/type?typeId="+this.deleteTarget, {
        headers: { token: this.token }
      });
      if (res.data.success){
        this.$message({
          message: '删除成功',
          type: 'success'
        })
      }else{
        this.$message({
          message: '删除失败',
          type: 'error'
        })
      }
      this.dialogVisible = false;
      this.load()
    },
    openDialog(_id) {
      this.deleteTarget = _id;
      this.dialogVisible = true;
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