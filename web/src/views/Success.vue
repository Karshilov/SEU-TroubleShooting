<template>
  <div class="page">
    <div class="title">提交成功！</div>
    <div class="title-hint">我们已经收到您反馈的故障信息，技术人员正在为您处理。请您保持填写的联系电话畅通，同时留意微信公众号消息。</div>
    <div class="content">
    <el-button @click="close">确认关闭</el-button>
    </div>
  </div>
</template>

<script>
export default {
  methods:{
    close(){
      wx.closeWindow()
    }
  }
};
</script>

<style>
</style>