<template>
  <div id="type-view" class="page">
    <div>
      <div class="title">微信菜单设置</div>
      <div class="title-hint">
        配置微信公众号底部菜单
        <br />⚠️名称为“故障申报”和“处理进度”的二级菜单会被自动替换成对应的功能链接，您可以自由组合菜单排布。
        <br />⚠️不包含二级菜单的一级菜单将不会显示
      </div>
      <div class="content">
        <el-button type="primary" @click="push">更新菜单</el-button>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">「菜单一」设置</div>
      <div class="title-hint">设置公众号底部左起「第 1 个」菜单的内容</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="一级名称">
            <el-input v-model="menu1Name" placeholder="左侧一级菜单显示名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="setMenu1Name">设置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="subtitle">「菜单一」二级菜单设置</div>
      <div class="title-hint">设置公众号底部左起「第 1 个」菜单的二级菜单，如需修改现有菜单项请删除后重新添加</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="显示名称">
            <el-input v-model="menu1NewSub.title" placeholder="指定二级菜单显示名称（不超过7个字符）"></el-input>
          </el-form-item>
          <el-form-item label="菜单链接">
            <el-input v-model="menu1NewSub.url" placeholder="指定菜单链接"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addMenu1Sub">添加</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="menu1List" style="width: 100%">
          <el-table-column prop="title" label="菜单名称"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button @click="move(scope, 'UP', menu1List)" type="text" size="small">上移</el-button>
              <el-button @click="move(scope, 'DOWN', menu1List)" type="text" size="small">下移</el-button>
              <el-button @click="openDialog(scope.row)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">「菜单二」设置</div>
      <div class="title-hint">设置公众号底部左起「第 2 个」菜单的内容</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="一级名称">
            <el-input v-model="menu2Name" placeholder="左侧一级菜单显示名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="setMenu2Name">设置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="subtitle">「菜单二」二级菜单设置</div>
      <div class="title-hint">设置公众号底部左起「第 2 个」菜单的二级菜单，如需修改现有菜单项请删除后重新添加</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="显示名称">
            <el-input v-model="menu2NewSub.title" placeholder="指定二级菜单显示名称（不超过7个字符）"></el-input>
          </el-form-item>
          <el-form-item label="菜单链接">
            <el-input v-model="menu2NewSub.url" placeholder="指定菜单链接"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addMenu2Sub">添加</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="menu2List" style="width: 100%">
          <el-table-column prop="title" label="菜单名称"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button @click="move(scope, 'UP', menu2List)" type="text" size="small">上移</el-button>
              <el-button @click="move(scope, 'DOWN', menu2List)" type="text" size="small">下移</el-button>
              <el-button @click="openDialog(scope.row)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div style="margin-top:40px;">
      <div class="title">「菜单三」设置</div>
      <div class="title-hint">设置公众号底部左起「第 3 个」菜单的内容</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="一级名称">
            <el-input v-model="menu3Name" placeholder="左侧一级菜单显示名称"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="setMenu3Name">设置</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="subtitle">「菜单三」二级菜单设置</div>
      <div class="title-hint">设置公众号底部左起「第 3 个」菜单的二级菜单，如需修改现有菜单项请删除后重新添加</div>
      <div class="content">
        <el-form label-width="80px">
          <el-form-item label="显示名称">
            <el-input v-model="menu3NewSub.title" placeholder="指定二级菜单显示名称（不超过7个字符）"></el-input>
          </el-form-item>
          <el-form-item label="菜单链接">
            <el-input v-model="menu3NewSub.url" placeholder="指定菜单链接"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addMenu3Sub">添加</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="menu3List" style="width: 100%">
          <el-table-column prop="title" label="菜单名称"></el-table-column>
          <el-table-column label="操作" width="120">
            <template slot-scope="scope">
              <el-button @click="move(scope, 'UP', menu3List)" type="text" size="small">上移</el-button>
              <el-button @click="move(scope, 'DOWN', menu3List)" type="text" size="small">下移</el-button>
              <el-button @click="openDialog(scope.row)" type="text" size="small">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <el-dialog title="提示" :visible.sync="dialogVisible" width="90%" >
      <span>是否确定删除</span>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="deleteItem">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menu1Name: "",
      menu2Name: "",
      menu3Name: "",
      menu1NewSub: {
        title: "",
        url: ""
      },
      menu2NewSub: {
        title: "",
        url: ""
      },
      menu3NewSub: {
        title: "",
        url: ""
      },
      menu1List: [],
      menu2List: [],
      menu3List: [],
      token: "",
      dialogVisible: false,
      deleteTarget: ""
    };
  },
  methods: {
    async push() {
      let res = await this.$axios.post(
        "/menu/push",
        {},
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "推送成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "出现错误：" + res.data.errmsg,
          type: "error"
        });
      }
      this.load();
    },
    async setMenu1Name() {
      let res = await this.$axios.post(
        "/menu",
        {
          level: 1,
          position: "LEFT",
          title: this.menu1Name
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "请重试",
          type: "error"
        });
      }
      this.load();
    },
    async setMenu2Name() {
      let res = await this.$axios.post(
        "/menu",
        {
          level: 1,
          position: "CENTER",
          title: this.menu2Name
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "请重试",
          type: "error"
        });
      }
      this.load();
    },
    async setMenu3Name() {
      let res = await this.$axios.post(
        "/menu",
        {
          level: 1,
          position: "RIGHT",
          title: this.menu3Name
        },
        {
          headers: { token: this.token }
        }
      );
      if (res.data.success) {
        this.$message({
          message: "保存成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "请重试",
          type: "error"
        });
      }
      this.load();
    },
    async addMenu1Sub() {
      if (this.menu1NewSub.title.length > 7) {
        this.$message.error("标题不能超过7个字符");
        return;
      }
      let res = await this.$axios.post(
        "/menu",
        {
          level: 2,
          position: "LEFT",
          title: this.menu1NewSub.title,
          url: this.menu1NewSub.url
        },
        {
          headers: { token: this.token }
        }
      );
      if (!res.data.success) {
        this.$message.error(res.data.errmsg);
      }
      this.menu1NewSub.title = "";
      this.menu1NewSub.url = "";
      this.load();
    },
    async addMenu2Sub() {
      if (this.menu2NewSub.title.length > 7) {
        this.$message.error("标题不能超过7个字符");
        return;
      }
      let res = await this.$axios.post(
        "/menu",
        {
          level: 2,
          position: "CENTER",
          title: this.menu2NewSub.title,
          url: this.menu2NewSub.url
        },
        {
          headers: { token: this.token }
        }
      );
      if (!res.data.success) {
        this.$message.error(res.data.errmsg);
      }
      this.menu2NewSub.title = "";
      this.menu2NewSub.url = "";
      this.load();
    },
    async addMenu3Sub() {
      if (this.menu3NewSub.title.length > 7) {
        this.$message.error("标题不能超过7个字符");
        return;
      }
      let res = await this.$axios.post(
        "/menu",
        {
          level: 2,
          position: "RIGHT",
          title: this.menu3NewSub.title,
          url: this.menu3NewSub.url
        },
        {
          headers: { token: this.token }
        }
      );
      if (!res.data.success) {
        this.$message.error(res.data.errmsg);
      }
      this.menu3NewSub.title = "";
      this.menu3NewSub.url = "";
      this.load();
    },
    async move(scope, direction, list) {
      let index = scope.$index;
      let id1 = scope.row._id;
      let id2 = "";
      if (direction === "UP" && index === 0) {
        return;
      }
      if (direction === "DOWN" && index === list.length - 1) {
        return;
      }
      if (direction === "UP") {
        id2 = list[scope.$index - 1]._id;
      } else {
        id2 = list[scope.$index + 1]._id;
      }
      await this.$axios.post(
        "/menu/exchange",
        { id1, id2 },
        {
          headers: { token: this.token }
        }
      );
      this.load();
    },
    async load() {
      let res = await this.$axios.get("/menu", {
        headers: { token: this.token }
      });
      res = res.data.result;
      this.menu1Name = res.LEFT.title;
      this.menu1List = res.LEFT.sub;
      this.menu2Name = res.CENTER.title;
      this.menu2List = res.CENTER.sub;
      this.menu3Name = res.RIGHT.title;
      this.menu3List = res.RIGHT.sub;
    },
    async deleteItem(row) {
      const res = await this.$axios.delete("/menu?id=" + this.deleteTarget._id, {
        headers: { token: this.token }
      });
      if(res.data.success){
        this.$message({
          message: '删除成功',
          type: 'success'
        });
      }else{
        this.$message({
          message: '删除失败',
          type: 'error'
        });
      }
      this.load();
      this.dialogVisible = false;
    },
    async openDialog(row){
      this.deleteTarget = row;
      this.dialogVisible = true;
    }
  },
  created() {
    this.token = this.$route.params.token;
    this.load();
  }
};
</script>

<style>
#type-view {
  margin-top: 30px;
}
</style>