<template>
  <div class="page">
    <div>
      <div class="title">故障单详情</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item style="margin-bottom:0" label="故障单号">{{troubleId.toUpperCase()}}</el-form-item>
          <el-form-item style="margin-bottom:0" label="故障类型">{{detail.typeName}}</el-form-item>
          <el-form-item style="margin-bottom:0" label="报修时间">{{formatTime(detail.createdTime)}}</el-form-item>
          <el-form-item style="margin-bottom:0" label="故障描述">{{detail.desc}}</el-form-item>
          <el-form-item style="margin-bottom:0" label="联系电话">{{detail.phonenum}}</el-form-item>
          <el-form-item style="margin-bottom:0" label="报修地点">{{detail.address}}</el-form-item>
          <el-form-item style="margin-bottom:0" label="负责人员">{{`${detail.staffName} (${detail.staffCardnum})`}}</el-form-item>
          <el-form-item v-if="detail.image" style="margin-bottom:0" label="图片附件">
            <img :src="detail.image" style="width:100%;border-radius:8px;" />
          </el-form-item>
        </el-form>
      </div>
    </div>
    <div v-if="message.length > 0 || detail.canPostMessage">
      <div class="subtitle">留言消息</div>
      <div class="content">
        <div class="message" v-for="item in message" :key="item._id">
          <div
            class="message-meta"
          >{{item.fromWho === 'staff' ? '工作人员':'用户'}} {{formatTime(item.time)}}</div>
          <div class="message-content">{{item.content}}</div>
        </div>
        <el-input
          v-if="detail.canPostMessage"
          type="textarea"
          v-model="newMessage"
          placeholder="您可以发送留言"
        ></el-input>
        <el-button v-if="detail.canPostMessage" style="margin-top:15px;" @click="postMessage">发送</el-button>
      </div>
    </div>
    <div v-if="detail.canDeal" class="panel">
      <div class="subtitle">故障处理</div>
      <div class="title-hint">故障处理完成后点击此处，提醒用户验收处理结果</div>
      <div class="content">
        <el-button @click="deal" type="primary">处理完成</el-button>
      </div>
    </div>
    <div v-if="detail.canRedirect" class="panel">
      <div class="subtitle">派发处理</div>
      <div class="title-hint">将该故障单派发给其他工作人员处理</div>
      <div class="content">
        <div>
        <el-select v-model="redirectTo" placeholder="请选择">
          <el-option
            v-for="item in staffList"
            :key="item._id"
            :label="`${item.name}(${item.staffCardnum})`"
            :value="item.staffCardnum"
          ></el-option>
        </el-select>
        </div>
        <el-button style="margin-top:15px;" @click="redirect">派发</el-button>
      </div>
    </div>
    <div v-if="detail.canCheck || detail.showEvaluation" class="panel">
      <div class="subtitle">用户评价</div>
      <div class="content">
        <el-form v-if="detail.canCheck" label-width="110px">
          <el-form-item style="margin-bottom:0;" label="问题是否解决？">
            <el-radio v-model="checkStatus" :label="true">是</el-radio>
            <el-radio v-model="checkStatus" :label="false">否</el-radio>
          </el-form-item>
          <el-form-item style="margin-bottom:0;" label="服务评分">
            <el-rate v-model="evaluationLevel" style="margin-top:10px;"></el-rate>
          </el-form-item>
          <el-form-item label="意见建议">
            <el-input
              type="textarea"
              placeholder="请填写您对服务的意见和建议（可选）"
              v-model="evaluation"
              :autosize="{ minRows: 3, maxRows: 10}"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="check">评价</el-button>
          </el-form-item>
        </el-form>
        <el-form v-else label-width="80px">
          <el-form-item style="margin-bottom:0;" label="解决情况">{{detail.statusDisp}}</el-form-item>
          <el-form-item style="margin-bottom:0;" label="服务评分">
            <el-rate v-model="detail.evaluationLevel" style="margin-top:10px;" disabled></el-rate>
          </el-form-item>
          <el-form-item label="意见建议">{{detail.evaluation}}</el-form-item>
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
      checkStatus: true,
      evaluationLevel: 4,
      evaluation: "",
      newMessage: "",
      message: [],
      staffList: [],
      redirectTo: ""
    };
  },
  methods: {
    formatTime(time) {
      return moment(time).format("YYYY-MM-DD HH:mm:ss");
    },
    async loadMessage() {
      // 获取消息列表
      let res = await this.$axios.get("/message?troubleId=" + this.troubleId, {
        headers: { token: this.token }
      });
      this.message = res.data.result;
    },
    async load() {
      let res = await this.$axios.get("/trouble?troubleId=" + this.troubleId, {
        headers: { token: this.token }
      });
      this.detail = res.data.result;
      this.loadMessage()
      // 获取员工列表
      if (this.detail.canRedirect) {
        res = await this.$axios.get(
          "/department/staff",
          { headers: { token: this.token } }
        );
        this.staffList = res.data.result;
        this.redirectTo = res.data.result[0].staffCardnum
      }
    },
    async deal() {
      let res = await this.$axios.post(
        "/trouble/deal",
        { troubleId: this.troubleId },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.load();
      } else {
        this.$message.error(res.data.errmsg);
      }
    },
    async check() {
      await this.$axios.post(
        "/trouble/check",
        {
          troubleId: this.troubleId,
          evaluation: this.evaluation,
          evaluationLevel: this.evaluationLevel,
          accept: this.checkStatus
        },
        { headers: { token: this.token } }
      );
      this.load();
    },
    async postMessage() {
      await this.$axios.post(
        "/message",
        { troubleId: this.troubleId, message: this.newMessage },
        {
          headers: { token: this.token }
        }
      );
      this.newMessage = ''
      this.loadMessage();
    },
    async redirect(){
      await this.$axios.post(
        "/trouble/redirect",
        { troubleId: this.troubleId, staffCardnum:this.redirectTo },
        {
          headers: { token: this.token }
        }
      );
      //this.load()
      wx.closeWindow()
    }
  },
  async created() {
    this.troubleId = this.$route.params.troubleId;
    this.token = this.$route.params.token;
    this.load();
  }
};
</script>

<style scoped>
.key {
  font-weight: bold;
  margin-top: 15px;
  font-size: 18px;
  font-size: 16px;
}
.value {
  margin-top: 10px;
  color: #555;
  font-size: 14px;
}
.panel {
  margin-top: 5px;
}

.message {
  margin-bottom: 15px;
  margin-left: 10px;
}

.message-meta {
  color: #555;
  font-size: 14px;
}

.message-content {
  margin-top: 10px;
}
</style>