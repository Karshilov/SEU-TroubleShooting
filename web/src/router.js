import Vue from 'vue'
import Router from 'vue-router'


Vue.use(Router)

// 项目规范
// 1.组件名称（component）使用大写开头的驼峰命名
// 2.路由路径（path）使用横线分割
// 3.路由名称 (name) 使用小写开头的驼峰命名
// 4.所有路由均使用懒加载

export default new Router({
  routes: [
    {
      path: '/userbind/:token/:after/:afterArgs?',
      name: 'userBind',
      component: () => import('./views/UserBind.vue'),
      meta: {title: '绑定身份信息'}
    },
    {
      path: '/post/:token',
      name: 'troublePost',
      component: () => import('./views/TroublePost.vue')
    },
    {
      path: '/detail/:token/:troubleId',
      name: 'troubleDetail',
      component: () => import('./views/TroubleDetail.vue')
    },
    {
      path: '/list/:token',
      name: 'troubleList',
      component: () => import('./views/TroubleList.vue')
    },
    {
      path: '/department/:token',
      name: 'departmentAdmin',
      component: () => import('./views/Department.vue')
    },
    {
      path: '/type/:token',
      name: 'troubleTypeAdmin',
      component: () => import('./views/TroubleTypeAdmin.vue')
    },
    {
      path: '/config/:token',
      name: 'config',
      component: () => import('./views/Config.vue'),
      meta: {title: '系统配置'}
    },
  ]
})
