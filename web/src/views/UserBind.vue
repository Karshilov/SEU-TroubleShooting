<template>
  <div id="user-bind-view" v-loading="loading">
    <div class="title">绑定身份信息</div>
    <div class="title-hint">您需要先绑定身份信息才能继续使用</div>
    <div id="form">
      <el-form ref="form" :model="form" label-width="80px" :rules="rules">
        <el-form-item label="一卡通号" prop="cardnum">
          <el-input v-model="form.cardnum" :readonly="true" placeholder="一卡通号将作为唯一的身份凭据"></el-input>
        </el-form-item>
        <el-form-item label="真实姓名" prop="name">
          <el-input v-model="form.name" :readonly="true" placeholder="请填写真实姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话" prop="phonenum">
          <el-input v-model="form.phonenum" placeholder="请填写保持畅通的联系电话"></el-input>
        </el-form-item>
        <el-form-item label="联系地址">
          <el-input
            type="textarea"
            v-model="form.address"
            :autosize="{ minRows: 5, maxRows: 5}"
            placeholder="请输入宿舍地址/办公室地址便于运维人员准确定位问题"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="save">保存并继续</el-button>
          <el-button @click="clear">清除</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      token: "",
      form: {
        cardnum: "",
        name: "",
        phonenum: "",
        address: ""
      },
      rules: {
        cardnum: [{ validator: this.validateCardnum, trigger: "blur" }],
        name: [{ validator: this.validateName, trigger: "blur" }],
        phonenum: [{ validator: this.validatePhonenum, trigger: "blur" }]
      },
      after: "",
      afterArgs: ""
    };
  },
  methods: {
    validateCardnum(rule, value, callback) {
      if (!/\d{9}/.test(value)) {
        callback(new Error("请输入正确的一卡通号"));
      } else {
        callback();
      }
    },
    validateName(rule, value, callback) {
      if (!value) {
        callback(new Error("请输入真实姓名"));
      } else {
        callback();
      }
    },
    validatePhonenum(rule, value, callback) {
      if (!value) {
        callback(new Error("请输入正确的电话号码"));
      } else {
        callback();
      }
    },
    save() {
      this.$refs["form"].validate(async valid => {
        // console.log(valid);
        if (valid) {
          this.loading = true;
          let res = await this.$axios.post("/user/bind", this.form, {
            headers: { token: this.token }
          });
          this.loading = false;
          if (res.data.success) {
            this.$router.replace(
              `/${this.after}/${this.token}${this.afterArgs}`
            );
          } else {
            this.$message.error(res.data.errmsg);
          }
        }
      });
    },
    async clear() {
      this.form.cardnum = "";
      this.form.name = "";
      this.form.phonenum = "";
    }
  },
  async created() {
    this.token = this.$route.params.token;
    this.after = this.$route.params.after;
    this.afterArgs = this.$route.params.afterArgs
      ? "/" + this.$route.params.afterArgs
      : "";
    let res = await this.$axios.get("/user", {
      headers: { token: this.$route.params.token }
    });
    this.form.cardnum = res.data.result.cardnum;
    this.form.name = res.data.result.name
    // console.log(res);
  }
};
</script>

<style scoped>
#user-bind-view {
  margin-top: 70px;
}
#form {
  margin-top: 30px;
  margin-right: 20px;
  margin-left: 10px;
}
</style>