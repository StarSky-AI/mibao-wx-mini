const app=getApp();
var productListApi={
    toDetail:(e)=>{
        wx.navigateTo({
            url:"/pages/lease/detail/detail?goodsId="+e.currentTarget.dataset.id
        })
    },
    toStore:(e)=>{
        console.log(e.currentTarget.dataset.id)
        wx.navigateTo({
            url:"/pages/merchant/store/store?merchantId="+e.currentTarget.dataset.id
        })
    },
};

export default productListApi;