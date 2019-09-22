import axios from 'axios'

const AxiosPlugins = {
  install: (Vue) => {
    window.$axios = axios.create({
      baseURL: window.baseURL,
      transformResponse: function (data) {
        // 对 data 进行任意转换处理
        data = JSON.parse(data)
        return data;
      }
    })
    Vue.prototype.$axios = window.$axios
  }
}

export default AxiosPlugins