import fetch from './fetch.js';

/*个人中心模块api*/

const personalApi = {
  
  login:(data)=>{
    return fetch({
      url:'/login',
      method:'POST',
      data:data,
    });
  },
  
  /**
   * 获取用户信息
   * @param data
   */
  getInformation:(data)=>{
    return fetch({
      url:'/users/personalInformation',
      method:'GET',
      data:data,
    });
  },
  
  /**
   * 发送手机验证码
   * @param data
   */
  sendPhoneCode:(data)=>{
    return fetch({
      url:'/sendCode',
      method:'GET',
      data:data,
    });
  },
  
  /**
   * 获取发短信图片验证码
   * @param data
   */
  getCaptcha:(data)=>{
    return fetch({
      url:'/getCaptcha',
      method:'GET',
      data:data,
    });
  },
  
  /**
   * 绑定手机号
   * @param data
   */
  bindPhone:(data)=>{
    return fetch({
      url:'/bindUser',
      method:'POST',
      data:data,
    });
  },
    //完善信息接口
    getPerfectInfo:(data)=>{
        return fetch({
            url:'/users/perfectInfo',
            method:'POST',
            data:data
        });
    },
    OrderClassification:(data)=>{
        return fetch({
            url:'/reddot/getRedDotInfo',
            method:'GET',
            data:data
        });
    },
    //我的优惠券（可用）
    getCoupon:(data)=>{
        return fetch({
            url:'/user/bonus/unused/list',
            data:data,
            method:'GET',
        });
    },
    //我的优惠券（已使用）
    getCoupon2:(data)=>{
        return fetch({
            url:'/user/bonus/used/list',
            data:data,
            method:'GET',
        });
    },
    //我的优惠券（已过期）
    getCoupon3:(data)=>{
        return fetch({
            url:'/user/bonus/invalid/list',
            data:data,
            method:'GET',
        });
    },
    //查看我的商品收藏接口
    getshopList:(data)=>{
        return fetch({
            url:'/goodsCollects/me',
            data:data,
            method:'GET',
        });
    },
    //删除我收藏的商品
    removeShop:(data)=>{
      return fetch({
          url:'/goodsCollects/' + data.id,
          method:'DELETE'
      })
    },
    //查看我的店铺收藏接口
    getstoreList:(data)=>{
        return fetch({
            url:'/merchantCollects/me',
            data:data,
            method:'GET',
        });
    },
    removeStore:(data)=>{
      return fetch({
          url: '/merchantCollects/' + data.id,
          method: 'DELETE'
      })
    },
    //新增收货地址接口
    addAddress:(data)=> {
        return fetch({
            url:'/userContacts/',
            data:data,
            method:'POST',
        })
    },
    //编辑收货地址接口
    editAddress:(data)=> {
        return fetch({
            url:'/userContacts/' + data.id,
            data:data,
            method:'PUT',
        })
    },
    //删除收货地址接口
    getAddressRemove:(data)=> {
        return fetch({
            url:'/userContacts/' + data.id,
            data:data,
            method:'DELETE',
        })
    },
    //获取收货地址接口
    getAddressList:(data)=> {
        return fetch({
            url:'/userContacts/',
            data:data,
            method:'GET',
        })
    },

  
};

export default personalApi;