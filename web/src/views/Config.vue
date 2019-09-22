<template>
  <div id="config-view">
      <div class="title">系统配置</div>
      <div class="title-hint">在此处对故障报修系统进行后台配置</div>
      <div class="btn-box">
      <el-button type="primary">部门、错误类型、人员管理设置</el-button>
      </div>
      <div class="btn-box">
      <el-button type="primary">管理员设置</el-button>
      </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      token: ""
    };
  },
  created(){
    window.title = '系统配置'
    this.token = this.$route.params.token

  }
};
</script>

<style>
#config-view {
  margin-top:30px;
}
.btn-box{
    margin-left:20px;
    margin-top:20px;
}
</style>