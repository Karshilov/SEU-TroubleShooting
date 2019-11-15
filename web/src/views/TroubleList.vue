<template>
  <div class="page">
    <div style="text-align:center;">
    <el-radio-group v-model="statusFilter" @change="handleChange" size="small">
      <el-radio-button label="WAITING" @click="showWaiting">待受理</el-radio-button>
      <el-radio-button label="PENDING" @click="showPending">处理中</el-radio-button>
      <el-radio-button label="DONE" @click="showDone">{{role === 'USER' ? '待评价' : '待验收'}}</el-radio-button>
      <el-radio-button label="END" @click="showEnd">已完成</el-radio-button>
    </el-radio-group>
    <div class="content">
      <div v-for="item in list" :key="item._id" class="item" @click="detail(item._id)">
        <div style="display:flex;align-items:center;margin-top:10px;">
          <div class="item-status">{{statusDisp[item.status]}}</div>
          <div class="item-id">单号：{{item._id.toUpperCase()}}</div>
        </div>
        <div class="item-type">故障类型：{{item.typeName}}</div>
        <div class="item-desc">故障描述：{{item.desc.length > 40 ? item.desc.slice(0,40)+'...' : item.desc }}</div>
        <div class="item-time">报修时间：{{formatTime(item.createdTime)}}</div>
      </div>
      <div class="load-button" @click="loadMore">点击加载更多</div>
    </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
export default {
  data() {
    return {
      token:'',
      role:'USER',
      statusFilter:'WAITING',
      page:1,
      pagesize:10,
      list:[],
      statusDisp:{
        'WAITING':'待受理',
        'PENDING':'处理中',
        'DONE':'待评价',
        'ACCEPT':'已解决',
        'REJECT':'未解决',
        'CLOSED':'已关闭'
      }
    };
  },
  methods:{
    async loadMore(){
      let res = await this.$axios.get(
        `/trouble/list?statusFilter=${this.statusFilter}&role=${this.role}&page=${this.page}&pagesize=${this.pagesize}`,
        {headers:{token:this.token}}
        )
      let newItems = res.data.result
      if(newItems.length > 0){
        this.page = this.page + 1
        this.list = [...this.list, ...newItems]
      }
    },
    async showWaiting(){
      this.statusFilter = 'WAITING'
      this.page = 1
      this.list = []
      await this.loadMore()
    },
    async showPending(){
      this.statusFilter = 'PENDING'
      this.page = 1
      this.list = []
      await this.loadMore()
    },
    async showDone(){
      this.statusFilter = 'DONE'
      this.page = 1
      this.list = []
      await this.loadMore()
    },
    async showEnd(){
      this.statusFilter = 'END'
      this.page = 1
      this.list = []
      await this.loadMore()
    },
    formatTime(time){
      return moment(time).format('YYYY-MM-DD HH:mm:ss')
    },
    detail(id){
      this.$router.push(`/detail/${this.token}/${id}`)
    },
    async handleChange(status){
      this.statusFilter = status
      this.page = 1
      this.list = []
      await this.loadMore()
    }
  },
  async created(){
    this.role = this.$route.params.role
    this.token = this.$route.params.token
    this.loadMore()
  }
};
</script>

<style>
.item{
  text-align: left;
  border-top:solid 1px #F0F0F0;
  margin-top: 10px;
}

.item-desc{
  font-size: 14px;
  font-weight: bold;
  margin-top: 10px;
}

.item-type{
  font-size: 18px;
  margin-top: 10px;
}

.item-time{
  font-size:12px;
  margin-top:10px;
  color:#888;
}

.item-status{
  background: #409EFF;
  color:white;
  border-radius: 100px;
  width: 4em;
  text-align: center;
  padding: 3px;
  font-size: 12px;
  font-weight: bold;
  margin-right:10px;
}

.item-id{
  font-size:12px;
  color:#888;
}
.load-button{
  border-top:solid 1px #F0F0F0;
  border-bottom:solid 1px #F0F0F0;
  margin-top: 10px;
  padding-top: 15px;
  padding-bottom: 15px;
  color:#888;
  font-size: 18px;
}
</style>