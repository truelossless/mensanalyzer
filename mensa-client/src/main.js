import Vue from 'vue'
import App from './App.vue'
import 'skeleton-css/css/normalize.css'
import 'skeleton-css/css/skeleton.css'
import axios from 'axios'

Vue.config.productionTip = false
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8083'

new Vue({
  render: h => h(App),
}).$mount('#app')
