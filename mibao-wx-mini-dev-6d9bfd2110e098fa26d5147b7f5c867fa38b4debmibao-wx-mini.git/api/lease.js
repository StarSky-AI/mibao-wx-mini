import fetch from './fetch.js';

/*下单模块api*/

const leaseApi = {
    getCoupon:(data)=>{ // 获取优惠券
        return fetch({
            url:'/user/bonus/'+data.goodsId+'/unused',
            method:'get',
            data:{
                price:data.price
            }
        })
    },
    getAgreement:()=>{ // 获取协议
        return fetch({
            url:'/common/ismtAgmtToView',
            method:'get',
        })
    },
    getAddress:()=>{ // 获取用户收货地址
        return fetch({
            url:'/userContacts',
            method:'get',
        })
    },
    getMerchantStore:(data)=>{ // 获取门店列表
        return fetch({
            url:'/merchantStore/list/'+data.merchantId,
            method:'get',
            data:{
                "pageNum": data.pageNum,
                "pageSize": data.pageSize
            }
        })
    },
    getLeaseReser:(data)=>{ // 获取门店列表
        return fetch({
            url:'/order/lease/reservation',
            method:'post',
            data:data
        })
    },
    getUserContacts:(data)=>{ // 获取单个地址
        return fetch({
            url:'/userContacts/'+data.id,
            method:'get'
        })
    },
    queryWhiteListed:(data)=>{ // 获取商品是否是白名单
        return fetch({
          url:'/face/recognitionStatus',
          data:data,
          method:'POST',
        });
      },
};
export default leaseApi;