<template>
  <div id="type-view" class="page">
    <div>
      <div class="title">微信关键字回复设置</div>
      <div class="title-hint">
        「关键字」回复有两种类型「文本」和「图文」
        <br/>⚠️同一种「关键字」只能设置为一种类型
        <br/>⚠️当「关键字」为「首次关注」时，在首次关注公众号时回复相关内容
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="subtitle">设置「文本」类型「关键字」</div>
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
        <el-table :data="keyText" style="width: 100%">
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
    <div style="margin-top:40px;">
      <div class="subtitle">设置「图文」类型「关键字」</div>
      <div class="content">
        <el-form label-width="70px">
          <el-form-item label="关键字">
            <el-input v-model="setKey"></el-input>
          </el-form-item>
          <el-form-item label="标题">
            <el-input v-model="setTitle" ></el-input>
          </el-form-item>
          <el-form-item label="描述">
            <el-input v-model="setDescription" ></el-input>
          </el-form-item>
          <el-form-item label="跳转链接">
            <el-input v-model="setUrl" ></el-input>
          </el-form-item>
          <el-form-item label="图片附件">
            <img v-if="localImage" :src="localImage" />
            <el-button @click="chooseImage">{{localImage ? '重新选择':'选择图片'}}</el-button>
            <el-button type="danger" v-if="localImage" @click="()=>{this.localImage = ''}">删除图片</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addKey">设置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="content">
        <el-table :data="keyNews" style="width: 100%">
          <el-table-column prop="key" label="关键字"></el-table-column>
          <el-table-column prop="title" label="标题"></el-table-column>
          <el-table-column prop="title" label="描述"></el-table-column>
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
      setTitle:"",
      setDescription:"",
      setUrl:"",
      setImage:"",
      keyText:[],
      keyNews:[],
      token: "",
      localImage: "",
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
    },
    chooseImage() {
      let that = this;
      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ["compressed"], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ["album", "camera"], // 可以指定来源是相册还是相机，默认二者都有
        success: function(res) {
          let localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          that.localImage = localIds[0];
        }
      });
    },
    uploadImage() {
      let that = this;
      return new Promise((resolve) => {
        wx.uploadImage({
          localId: that.localImage, // 需要上传的图片的本地ID，由chooseImage接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: function(res) {
            that.setImage = res.serverId; // 返回图片的服务器端ID
            resolve();
          }
        });
      });
    },
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