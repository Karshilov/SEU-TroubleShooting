<template>
  <div class="page">
    <div class="title">禁止访问！</div>
    <div class="title-hint">没有访问权限，请联系管理员。</div>
    <div class="content">
    <el-button @click="close" type="warning">退出</el-button>
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