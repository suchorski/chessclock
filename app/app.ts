import Vue from 'nativescript-vue'
import { Application } from '@nativescript/core'
import { firebase } from '@nativescript/firebase'
import Home from '@/components/Home.vue'
import { Configuration } from '@/classes/configuration'
import { localize } from '@nativescript/localize'

declare let __DEV__: boolean

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = !__DEV__

firebase.init()

Vue.prototype.$firebase = firebase

Application.on(Application.launchEvent, () => {
  if (!Configuration.check()) {
    console.log('Restarting local configurations...')
    Configuration.reset()
  }
})

Vue.filter('L', localize)
Vue.prototype.$localize = localize

new Vue({
  render: (h) => h('frame', [h(Home)]),
}).$start()
