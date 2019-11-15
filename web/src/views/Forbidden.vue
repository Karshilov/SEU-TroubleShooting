<template>
  <div class="page">
    <div class="title">无权访问！</div>
    <div class="title-hint">该故障已交由其他部门处理</div>
    <div class="content">
    <el-button @click="close" type="danger">退出</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {
    close() {
      wx.closeWindow();
    }
  }
};
</script>

<style>
</style>