import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './axios'
import './plugins/element.js'

Vue.config.productionTip = false
window.baseURL = 'http://47.106.227.224/zzj-wechat/'

Vue.use(axios)
router.afterEach(() => {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
})
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

