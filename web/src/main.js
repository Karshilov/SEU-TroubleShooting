import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './axios'
import './plugins/element.js'

Vue.config.productionTip = false
window.baseURL = 'https://myseu.cn/grh/'

Vue.use(axios)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// 激活wx-jssdk
window.$axios.get("/jssdk").then((wxConfig) => {
  wx.config(wxConfig.data.result);
})

wx.ready(function(){
  wx.hideAllNonBaseMenuItem();
});

