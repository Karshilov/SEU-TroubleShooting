<template>
  <div id="post-view" class="page">
    <div class="title">故障报修</div>
    <div class="title-hint">
      很抱歉给您带来不便。
      请您准确详实的反馈遇到的问题，我们的工作人员将会尽其所能为您提供帮助。
    </div>
    <div style="margin-top: 30px;margin-right: 20px;margin-left: 10px;">
      <el-form :model="form" label-width="80px" v-loading="loading">
        <el-form-item label="故障类型">
          <el-select @change="typeSelect" v-model="form.typeId" placeholder="请选择">
            <el-option
              v-for="item in typeList"
              :key="item._id"
              :label="item.displayName"
              :value="item._id"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="typeDesc" label="类型描述">
            <div style="margin-left:5px" class="text item">{{typeDesc}}</div>
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input
            type="textarea"
            placeholder="请详细描述您遇到的问题，这将有助于我们的技术人员确定问题的解决方案"
            v-model="form.desc"
            :autosize="{ minRows: 3, maxRows: 10}"
          ></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input placeholder="故障处理期间请保证畅通" v-model="form.phonenum"></el-input>
        </el-form-item>
        <el-form-item label="联系地址">
          <el-input
            type="textarea"
            placeholder="请填写您的办公室/宿舍地址以便于排查问题"
            v-model="form.address"
            :autosize="{ minRows: 3, maxRows: 3}"
          ></el-input>
        </el-form-item>
        <el-form-item label="图片附件">
          <img v-if="localImage" :src="localImage" />
          <el-button @click="chooseImage">{{localImage ? '重新选择':'选择图片'}}</el-button>
          <el-button type="danger" v-if="localImage" @click="()=>{this.localImage = ''}">删除图片</el-button>
        </el-form-item>
        <el-form-item>
          <el-button @click="save" type="primary">提交故障报告</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: "",
      typeList: [],
      typeDesc:"",
      form: {
        typeId: "",
        phonenum: "",
        desc: "",
        address: "",
        image: ""
      },
      localImage: "",
      loading: false
    };
  },



  methods: {
    typeSelect(val){
      console.log(val);
      this.typeDesc=this.typeList.filter(i=>{
        return val===i._id;
      })[0].typeDesc
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
      return new Promise((resolve, reject) => {
        wx.uploadImage({
          localId: that.localImage, // 需要上传的图片的本地ID，由chooseImage接口获得
          isShowProgressTips: 1, // 默认为1，显示进度提示
          success: function(res) {
            that.form.image = res.serverId; // 返回图片的服务器端ID
            resolve();
          }
        });
      });
    },
    async save() {
      // 上传图片
      this.loading = true;
      if (this.localImage) {
        await this.uploadImage();
      }
      let res = await this.$axios.post("/trouble", this.form, {
        headers: { token: this.token }
      });
      if (res.data.success) {
        //this.$message({type:'success', message:res.data.result})
        this.$router.replace("/success");
      } else {
        this.$message.error(res.data.errmsg);
        this.loading = false;
      }
    }
  },
  async created() {
    this.token = this.$route.params.token;
    // 获取故障类型列表
    let res = await this.$axios.get("/type");
    this.typeList = res.data.result;
    // 获取预留信息
    res = await this.$axios.get("/user", { headers: { token: this.token } });
    let userInfo = res.data.result;
    this.form.phonenum = userInfo.phonenum;
    this.form.address = userInfo.address;
  }
};
</script>

<style scoped>
#post-view {
  margin-top: 30px;
}
img {
  width: 100%;
  border-radius: 8px;
}
</style>