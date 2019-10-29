/*!
 * =====================================================
 * 访问接口定义
 * author: rensl
 * =====================================================
 */

import {
    Service
} from './axios.js'

export function getFileList() {
    return Service({
        url: 'fileList',
        method: 'get',
    })
}

export function deleteFile(index) {
    return Service({
        url: `delete?index=${index}`,
        method: 'get'
    })
}

export function uploadFile(object) {
    return Service({
        url: 'upload',
        method: 'post',
        data: object
    })
}

export function getData(index) {
    return Service({
        url: `getdata?index=${index}`,
        method: 'get',
    })
}