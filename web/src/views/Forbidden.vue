<template>
  <div class="page">
    <div class="title">{{`${title}`}}</div>
    <div class="title-hint">{{`${hint}`}}</div>
    <div class="content">
      <el-button @click="close" type="danger">退出</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      errcode:"",
      title:"",
      hint:"",
    };
  },
  methods: {
    close() {
      wx.closeWindow();
    }
  },
  created() {
    this.errcode = this.$route.query.errcode
    if(this.errcode == -1){
      this.title = "无权访问";
      this.hint = "该故障已交由其他部门处理";
      window.title = "禁止访问";
    }else if (this.errcode == 1){
      this.title = "无法访问";
      this.hint = "该故障被删除";
      window.title = "无法访问";
    }else{
      this.title = "无法访问";
      window.title = "无法访问";
    }

  }
};
</script>

<style>
</style>