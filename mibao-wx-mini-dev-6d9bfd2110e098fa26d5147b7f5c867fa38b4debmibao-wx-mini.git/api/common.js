import fetch from './fetch.js';

const commonApi = {
    //   获取小程序码
    xcxCode:(data)=>{
        return fetch({
            url:'/goods/getWxCode',
            method:'POST',
            data:data
        })
    },
};

export default commonApi;