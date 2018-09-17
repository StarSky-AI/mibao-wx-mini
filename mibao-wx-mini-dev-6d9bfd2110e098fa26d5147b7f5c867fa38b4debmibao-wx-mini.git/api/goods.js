import fetch from './fetch.js';

/*商品列表页模块api*/

const goodsApi = {
    getDetail:(data)=>{ // 获取商品详情
        return fetch({
            url:'goods/'+data.goodsId,
            method:'get',
        })
    },
    getParameters: function (data) { // 获取商品参数
        return fetch({
            url: `goods/parameters/group`,
            method: 'get', 
            data: data
        })
    },
    getGoodsPrice(data) { //获取规格价格
        return fetch({
            url: "/goods/goodsPricePost",
            method: 'post',
            data: data
        })
    },
    getGoodsCommentList(data) { // 获取评价列表
        return fetch({
            url: "/comments/goodsCommentList/"+data.goodsId,
            method: 'get',
            data: data
        })
    },
    getCollectGoods(data){ // 获取当前商品是否收藏
        return fetch({
            url: "/goodsCollects/isCollect/"+data.merchantId+"/"+data.goodsId,
            method: 'get'
        })
    },
    controlCollectGoods(data){  // 对商品进行收藏
        return fetch({
            url: "/goodsCollects/collect/"+data.merchantId+"/"+data.goodsId,
            method: 'post'
        })
    }
};
export default goodsApi;