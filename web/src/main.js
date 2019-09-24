import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from './axios'
import './plugins/element.js'

Vue.config.productionTip = false
<<<<<<< HEAD
window.baseURL = 'https://myseu.cn/hkh/'
=======
window.baseURL = 'https://myseu.cn/rlh/'
>>>>>>> c1ec70183244b697bc2eec49638a2b2acd18df37

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

