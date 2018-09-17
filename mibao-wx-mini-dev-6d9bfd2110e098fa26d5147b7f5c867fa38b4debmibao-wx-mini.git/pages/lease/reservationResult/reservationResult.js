Page({

    /**
     * 页面的初始数据
     */
    data: {
      result:false,
      orderId:0,
      errorMag:''
    },
  
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let result = options.result;
        if(result){ // 下单成功
            this.setData({
                orderId:options.orderId,
                result:result
            })
        }else{
            this.setData({
                errorMag:options.errorMag,
                result:result
            })
        }
    },
    seeOrder(){
        wx.navigateTo({
            url:"/pages/order/orderList/orderList"
        })
    },
    goHome(){
        wx.switchTab({
            url:"/pages/home/index/index"
        })
    },
  })