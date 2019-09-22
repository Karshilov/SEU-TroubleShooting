<template>
  <div id="department-view" class="page">
    <div>
        <div class="title">添加部门</div>
        <div class="title-hint">部门是组织人员和故障类型的实体，用户报告的故障信息会被汇聚到部门中，然后自动派发给部门的成员</div>
        <div class="content">
            <el-form label-width="70px">
                <el-form-item label="部门名称">
                    <el-input v-model="departmentName"></el-input>
                </el-form-item>
                <el-form-item>
                <el-button type="primary" @click="add">添加</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
    <div>
        <div class="title">管理部门设置</div>
        <div class="title-hint">修改部门负责的故障类型和部门管理的人员信息</div>
        <div class="content">
            
        </div>
    </div>
  </div>
</template>

<script>
export default {
    data(){
        return {
            list:[],
            token:'',
            departmentName:''
        }
    },
    methods:{
        async add(){
            let res = await this.$axios.post('/department',{departmentName:this.departmentName},{headers:{token:this.token}})
            if(res.data.success){
                this.$message({type:'success', message:'添加成功'})
                this.load()
            } else {
                this.$message.error(res.data.errmsg)
            }
        },
        async load(){
            let res = await this.$axios.get('/department',{headers:{token:this.token}})
            this.list = res.data.result
        }
    },
    created(){
        this.token = this.$route.params.token
        this.load()
    }
}
</script>

<style>
#department-view{
    margin-top:30px;
}
</style>