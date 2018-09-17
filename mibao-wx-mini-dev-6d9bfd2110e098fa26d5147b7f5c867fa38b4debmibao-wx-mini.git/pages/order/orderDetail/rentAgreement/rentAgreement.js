// pages/order/orderDetail/rentAgreement/rentAgreement.js
import orderApi from "../../../../api/order";
import WxParse from '../../../../wxParse/wxParse.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:'',
      content:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if(options.id)
      {
          this.setData({
              orderId:options.id
          })
      }

        this.getAgreement();


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
    getAgreement(){
        var that = this;
        orderApi.getAgreement({id:this.data.orderId})
            .then(resp=>{
              if(resp.code==200)
              {
                  let html=resp.data;
                  WxParse.wxParse('insertData','html',html,that)
              }
              else
              {
                this.$toast(resp.message)
              }
            }).catch(e=>{
            this.$networkErr(e);
        })
    }
})