import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    statusFilter:'',
  },
  mutations: {
    toChange(state, target){
      state.statusFilter = target
    },
    clear(state){
      state.statusFilter = ''
    }
  },
  actions: {
  }
})
