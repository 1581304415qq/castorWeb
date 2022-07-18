import Vue from 'vue'
import Router from 'vue-router'
import Gps from '@/components/Gps'
import Canvas from '@/components/Canvas'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Canvas',
      component: Canvas,
    }
    ,{
      path: '/gps',
      name: 'Gps',
      component: Gps
    }
  ]
})
