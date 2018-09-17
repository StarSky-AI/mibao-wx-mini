import fetch from './fetch.js';

/*首页模块api*/

const homeApi = {
    //首页banner和热门商品
    getIndex:()=>{
        return fetch({
            url:'/miniProgram/index',
            method:'GET'
        })
    },
    //一级分类
    getCategory:()=>{
        return fetch({
            url:'/goods/category/list',
            method:'GET',
        })
    },
//    根据一级分类获取二级分类
    getType:(data)=>{
        return fetch({
            url:'/goods/getAllType/'+data.id,
            method:'GET',
        })
    },
//    商品搜索页
    search:(data)=>{
        return fetch({
            url:'/openSearch/goodsSearch',
            method:'GET',
            data:data
        })
    },
//    热搜词
    hotWords:()=>{
        return fetch({
            url:'/goods/heatSearchGet',
            method:'GET',
        })
    }

};

export default homeApi;