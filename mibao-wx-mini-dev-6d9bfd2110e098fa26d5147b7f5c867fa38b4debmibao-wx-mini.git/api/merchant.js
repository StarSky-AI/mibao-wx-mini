import fetch from './fetch.js';

/*商户api*/

const merchantApi = {
    //    店铺搜索
    search:(data)=>{
        return fetch({
            url:'/goods/goodsByMerchant',
            method:'GET',
            data:data
        })
    },
//    查询是否收藏该商户 /merchantCollects/isCollect/{merchantId}
    isCollect:(data)=>{
        return fetch({
            url:`/merchantCollects/isCollect/${data.id}`,
            method:'GET',
            data:data
        })
    },
//    店铺收藏
    storeCollect:(data)=>{
        return fetch({
            url:'/merchantCollects/collect/'+data.id,
            method:'POST'
        })
    },
//    取消店铺收藏
    celstoreCollect:(data)=>{
        return fetch({
            url:'/merchantCollects/'+data.id,
            method:'DELETE'
        })
    },
//    店铺首页banner hot
    storeIndex:(data)=>{
        return fetch({
            url:'/merchantHomePage/detail/'+data.id,
            method:'GET'
        })
    },
    //    店铺详情
    storeInfo:(data)=>{
        return fetch({
            url:'/merchant/'+data.id,
            method:'GET'
        })
    },
};

export default merchantApi;