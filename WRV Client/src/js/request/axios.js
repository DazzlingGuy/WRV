/*!
 * =====================================================
 * axios 封装
 * author: rensl
 * =====================================================
 */

import axios from 'axios'

import {
    Message,
    Loading
} from 'element-ui'

const customBaseURL = 'http://localhost:9090/'

let loadingInstance = null

// default is post methods
export const Service = axios.create({
    timeout: 20000,
    baseURL: customBaseURL,
    method: 'post',
    // request header
    headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=utf-8"
    },
    withCredentials: true
})

var errorProcess = error => {
    const message = error.Message !== undefined ? error.Message : ''
    Message({
        message: 'Nerwork error: ' + message,
        type: 'error',
        duration: 3 * 1000
    })
    loadingInstance.close()
    return Promise.reject(error)
}

Service.interceptors.request.use(config => {
    loadingInstance = Loading.service({
        lock: true,
        text: 'Loading...',
        background: "rgba(0, 0, 0, 0.8)",
        spinner: "el-icon-loading"
    })
    return config
}, errorProcess)

Service.interceptors.response.use(response => {
    loadingInstance.close()
    return response.data
}, errorProcess)