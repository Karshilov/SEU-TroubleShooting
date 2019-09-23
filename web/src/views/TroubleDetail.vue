<template>
  <div class="page">
    <div>
      <div class="title">故障单详情</div>
      <div class="content">
        <el-form>
        <el-form-item style="margin-bottom:0" label="故障单号">
          {{troubleId.toUpperCase()}}
        </el-form-item>
        <el-form-item style="margin-bottom:0" label="故障类型">
          {{detail.typeName}}
        </el-form-item>
        <el-form-item style="margin-bottom:0" label="报修时间">
          {{formatTime(detail.createdTime)}}
        </el-form-item>
        <el-form-item style="margin-bottom:0" label="故障描述">
          {{detail.desc}}
        </el-form-item>
        <el-form-item style="margin-bottom:0" label="联系电话">
          {{detail.phonenum}}
        </el-form-item>
        <el-form-item style="margin-bottom:0" label="报修地点">
          {{detail.address}}
        </el-form-item>
        <el-form-item v-if="detail.image" style="margin-bottom:0" label="图片附件">
          <img :src="detail.image" style="width:100%;border-radius:8px;" />
        </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="detail.canDeal" class="panel">
      <div class="subtitle">故障处理</div>
      <div class="title-hint">故障处理完成后点击此处，提醒用户验收处理结果</div>
      <div class="content">
        <el-button @click="deal">处理完成</el-button>
      </div>
    </div>
    <div v-if="detail.canCheck" class="panel">
      <div class="subtitle">用户评价</div>
      <div class="content">
      <el-form label-width="110px">
        <el-form-item style="margin-bottom:0;" label="问题是否解决？">
          <el-radio v-model="checkStatus" label="ACCEPT">是</el-radio>
          <el-radio v-model="checkStatus" label="REJECT">否</el-radio>
        </el-form-item>
        <el-form-item label="服务评分">
          <el-rate v-model="checkLevel" style="margin-top:10px;"></el-rate>
        </el-form-item>
      </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment";
export default {
  data() {
    return {
      token: "",
      troubleId: "",
      detail: "",
      checkStatus:'ACCEPT',
      checkLevel:0,
    };
  },
  methods: {
    formatTime(time) {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
    async load() {
      let res = await this.$axios.get("/trouble?troubleId=" + this.troubleId, {
        headers: { token: this.token }
      });
      this.detail = res.data.result;
    },
    async deal(){
      let res = await this.$axios.post("/trouble/deal",{troubleId:this.troubleId},{
        headers: { token: this.token }
      })
      if(res.data.success){
        this.load()
      } else {
        this.$message.error(res.data.errmsg)
      }
    }
  },
  async created() {
    this.troubleId = this.$route.params.troubleId;
    this.token = this.$route.params.token;
    this.load()
  }
};
</script>

<style scoped>
.key {
  font-weight: bold;
  margin-top: 15px;
  font-size: 18px;
  font-size:16px;
}
.value {
  margin-top: 10px;
  color: #555;
  font-size:14px;
}
.panel{
  margin-top:5px;
}
</style>