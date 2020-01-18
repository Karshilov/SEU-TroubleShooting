<template>
  <div id="type-view" class="page">
    <div>
      <div class="title">微信关键字回复设置设置</div>
      <div class="title-hint">
        ⚠️设置首次关注时自动回复
        <br/>⚠️设置「关键字」回复
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
            <el-input v-model="keyWord"></el-input>
          </el-form-item>
          <el-form-item label="回复内容">
            <el-input v-model="content" type="textarea" row=2></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="add">设置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="content">
        <el-table :data="list" style="width: 100%">
          <el-table-column prop="name" label="关键字"></el-table-column>
          <el-table-column prop="staffCardnum" label="回复内容"></el-table-column>
          <el-table-column label="操作" width="60">
            <template slot-scope="scope">
              <el-button @click="openDialog(scope.row.staffCardnum, 'staff')" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <el-dialog title="提示" :visible.sync="dialogVisible" width="90%" >
      <span>是否确定删除</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteItem">确定</el-button>
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
        "/wechatKey",
        {
          key: "首次关注",
          content: "firstRely"
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "推送成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "出现错误：" + res.data.errmsg,
          type: "error"
        });
      }
      this.load();
    },
    async push() {
      let res = await this.$axios.post(
        "/menu/push",
        {},
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "推送成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "出现错误：" + res.data.errmsg,
          type: "error"
        });
      }
      this.load();
    },
    async setMenu1Name() {
      let res = await this.$axios.post(
        "/menu",
        {
          level: 1,
          position: "LEFT",
          title: this.menu1Name
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "请重试",
          type: "error"
        });
      }
      this.load();
    },
    async setMenu2Name() {
      let res = await this.$axios.post(
        "/menu",
        {
          level: 1,
          position: "CENTER",
          title: this.menu2Name
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "请重试",
          type: "error"
        });
      }
      this.load();
    },
    async setMenu3Name() {
      let res = await this.$axios.post(
        "/menu",
        {
          level: 1,
          position: "RIGHT",
          title: this.menu3Name
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "请重试",
          type: "error"
        });
      }
      this.load();
    },
    async addMenu1Sub() {
      if (this.menu1NewSub.title.length > 7) {
        this.$message.error("标题不能超过7个字符");
        return;
      }
      let res = await this.$axios.post(
        "/menu",
        {
          level: 2,
          position: "LEFT",
          title: this.menu1NewSub.title,
          url: this.menu1NewSub.url
        },
        {
          headers: { token: this.token }
        }
      );
      if (!res.data.success) {
        this.$message.error(res.data.errmsg);
      }
      this.menu1NewSub.title = "";
      this.menu1NewSub.url = "";
      this.load();
    },
    async addMenu2Sub() {
      if (this.menu2NewSub.title.length > 7) {
        this.$message.error("标题不能超过7个字符");
        return;
      }
      let res = await this.$axios.post(
        "/menu",
        {
          level: 2,
          position: "CENTER",
          title: this.menu2NewSub.title,
          url: this.menu2NewSub.url
        },
        {
          headers: { token: this.token }
        }
      );
      if (!res.data.success) {
        this.$message.error(res.data.errmsg);
      }
      this.menu2NewSub.title = "";
      this.menu2NewSub.url = "";
      this.load();
    },
    async addMenu3Sub() {
      if (this.menu3NewSub.title.length > 7) {
        this.$message.error("标题不能超过7个字符");
        return;
      }
      let res = await this.$axios.post(
        "/menu",
        {
          level: 2,
          position: "RIGHT",
          title: this.menu3NewSub.title,
          url: this.menu3NewSub.url
        },
        {
          headers: { token: this.token }
        }
      );
      if (!res.data.success) {
        this.$message.error(res.data.errmsg);
      }
      this.menu3NewSub.title = "";
      this.menu3NewSub.url = "";
      this.load();
    },
    async move(scope, direction, list) {
      let index = scope.$index;
      let id1 = scope.row._id;
      let id2 = "";
      if (direction === "UP" && index === 0) {
        return;
      }
      if (direction === "DOWN" && index === list.length - 1) {
        return;
      }
      if (direction === "UP") {
        id2 = list[scope.$index - 1]._id;
      } else {
        id2 = list[scope.$index + 1]._id;
      }
      await this.$axios.post(
        "/menu/exchange",
        { id1, id2 },
        {
          headers: { token: this.token }
        }
      );
      this.load();
    },
    async load() {
      let res = await this.$axios.get("/wechatKey", {
        headers: { token: this.token }
      });
      res = res.data.result;
      this.firstReply = res['首次关注'] ? res['首次关注']:'';
      this.keyRecord = res.record;
    },
    async deleteItem() {
      const res = await this.$axios.delete("/menu?id=" + this.deleteTarget._id, {
        headers: { token: this.token }
      });
      if(res.data.success){
        this.$message({
          message: '删除成功',
          type: 'success'
        });
      }else{
        this.$message({
          message: '删除失败',
          type: 'error'
        });
      }
      this.load();
      this.dialogVisible = false;
    },
    async openDialog(row){
      this.deleteTarget = row;
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
#type-view {
  margin-top: 30px;
}
</style>