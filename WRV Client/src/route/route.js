import VueRouter from 'vue-router'

import FileListViewer from '../com/filelist-viewer.vue'
import ReportViewer from '../com/report-viewer.vue'

var router = new VueRouter({
    routes: [{
            path: '/',
            redirect: '/filelist'
        }, {
            path: '/filelist',
            component: FileListViewer
        },
        {
            path: '/report',
            component: ReportViewer
        }
    ],
    linkActiveClass: 'mui-active'
})

export default router