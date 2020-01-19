<template>
  <div id="type-view" class="page">
    <div>
      <div class="title">微信关键字回复设置</div>
      <div class="title-hint">
        ⚠️设置首次关注自动回复时，当回复内容为空时无效
        <br/>⚠️设置「关键字」回复时，回复内容不能为空
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">首次关注回复</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="回复内容">
            <el-input v-model="firstReply" placeholder="首次关注时回复" type="textarea" rows=4  ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="setFirstReply">设置</el-button>
            <el-button type="danger" @click="deleteFirstReply">删除</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">设置「关键字」回复</div>
      <div class="title-hint">此处列出所有关键字回复</div>
      <div class="content">
        <el-form label-width="70px">
          <el-form-item label="关键字">
            <el-input v-model="setKey"></el-input>
          </el-form-item>
          <el-form-item label="回复内容">
            <el-input v-model="setContent" type="textarea" row=2></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addKey">设置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="content">
        <el-table :data="keyRecord" style="width: 100%">
          <el-table-column prop="key" label="关键字" width="90"></el-table-column>
          <el-table-column prop="content" label="回复内容"></el-table-column>
          <el-table-column label="操作" width="60">
            <template slot-scope="scope">
              <el-button @click="openDialog(scope.row._id)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="90%" >
      <span>是否确定删除</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteKey">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      firstReply: "",
      setKey:"",
      setContent:"",
      keyRecord:[],
      token: "",
      dialogVisible: false,
      deleteTarget: ""
    };
  },
  methods: {
    async setFirstReply() {
      let res = await this.$axios.post(
        "/key",
        {
          KeyWord: "首次关注",
          content: this.firstReply
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "设置成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "设置失败：" + res.data.errmsg,
          type: "error"
        });
      }
      this.load();
    },
    async deleteFirstReply() {
      let res = await this.$axios.post(
        "/key",
        {
          KeyWord: "首次关注",
          content: ""
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "删除成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "删除失败：" + res.data.errmsg,
          type: "error"
        });
      }
      this.load();
    },
    async addKey() {
      if (!this.setKey) {
        this.$message({
          message: "关键字不能为空",
          type: "error"
        });
        return;
      }
      if (!this.setContent) {
        this.$message({
          message: "回复内容不能为空",
          type: "error"
        });
        return;
      }
      let res = await this.$axios.post(
        "/key",
        {
          KeyWord: this.setKey,
          content: this.setContent
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "设置成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "设置失败：" + res.data.errmsg,
          type: "error"
        });
      }
      this.load();
    },
    async deleteKey() {
      let res = await this.$axios.delete("/key?_id=" + this.deleteTarget, {
        headers: { token: this.token }
      });
      if (res.data.success) {
        this.$message({
          message: "删除成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "删除失败：" + res.data.errmsg,
          type: "error"
        });
      }
      this.dialogVisible = false;
      this.load();
    },
    async load() {
      let res = await this.$axios.get("/key", {
        headers: { token: this.token }
      });
      res = res.data.result;
      this.firstReply = res['首次关注'] ? res['首次关注']:'';
      this.keyRecord = res.record;
    },
    async openDialog(_id){
      this.dialogVisible = true;
      this.deleteTarget = _id;
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.load();
  }
};
</script>

<style>
#type-view {
  margin-top: 30px;
}
</style>