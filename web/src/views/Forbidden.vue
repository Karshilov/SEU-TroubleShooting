<template>
  <div id="forbidden-view" class="page">
    <el-row :gutter="20">
      <el-col :span="4"><div class="grid-content "></div></el-col>
      <el-col :span="16"><div class="grid-content red">禁止访问</div></el-col>
      <el-col :span="4"><div class="grid-content "></div></el-col>
    </el-row>
      
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  methods: {}
};
</script>

<style>
#admin-view {
  margin-top: 30px;
  font-size: 20px;
}
.el-row {
  margin-bottom: 20px;
}
.el-col {
  border-radius: 4px;
}

.red {
  background: #f56C6C;
}

.grid-content {
  border-radius: 4px;
  min-height: 50px;
}
</style>