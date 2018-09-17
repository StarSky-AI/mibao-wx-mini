// pages/personal/service/service.js
import service from '../../../images/base64/service.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //背景图
    service: service,
    phonecall: '4008130066',
    phone:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getTestData();
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
  // 点击拨打电话
  phonecallevent: function (e) {
    wx.makePhoneCall({
      phoneNumber: this.data.phonecall
    })
  },
  getTestData: function() {
    //格式化电话号
    let phone = this.data.phonecall.slice(0,3) + '-' + this.data.phonecall.slice(3,6) + '-' + this.data.phonecall.slice(6,10);
    this.setData({
      phone: phone
    })
  }
})