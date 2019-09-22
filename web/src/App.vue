<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app',
  components: {
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

.title{
  font-size:32px;
  font-weight:bold;
  margin-top:20px;
  margin-left:20px;
}

.title-hint{
  font-size:14px;
  color:#888;
  margin-top:15px;
  margin-left:20px;
}

.content{
  margin-top:20px;
  margin-left:20px;
}
.page{
  margin: 30px 20px 20px 0;

}

</style>
