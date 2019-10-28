// import lib
import Vue from 'vue'
import App from './App.vue'
import router from './route/route.js'
import VueResource from "vue-resource"
import VueRouter from 'vue-router'
import ViewUI from 'view-design';

// import css
import 'bootstrap/dist/css/bootstrap.css'
import 'view-design/dist/styles/iview.css'
import './lib/mui-master/dist/css/mui.css'
import './css/report.css'
import './css/app.css'
import './css/filelist.css'

// import com
import {
    Header
} from 'mint-ui'

import {
    Upload,
    Button,
    Input
} from 'element-ui'

import {
    Table
} from 'view-design'

// use com/lib
Vue.use(ViewUI);
Vue.use(VueResource)
Vue.use(VueRouter)

// register com
Vue.component(Header.name, Header)
Vue.component(Upload.name, Upload)
Vue.component(Button.name, Button)
Vue.component(Input.name, Input)
Vue.component(Table.name, Table)

var vm = new Vue({
    el: '#app',
    render: h => h(App),
    router: router
})