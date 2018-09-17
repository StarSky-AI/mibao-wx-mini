import fetch from './fetch.js';

/*商品列表页模块api*/

const listApi = {
    getProducts:(data)=>{
        return fetch({
            url:'/goods/searchList',
            method:'get',
            data:data,
        })
    }
};

export default listApi;