import Vue from 'vue'
import Router from 'vue-router'
import Gps from '@/components/Gps'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Gps',
      component: Gps
    }
  ]
})
