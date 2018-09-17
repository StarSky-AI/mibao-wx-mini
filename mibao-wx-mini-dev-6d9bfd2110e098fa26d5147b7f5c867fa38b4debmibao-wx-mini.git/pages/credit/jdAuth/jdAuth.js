// pages/credit/jdAuth/jdAuth.js
import env from '../../../config/env';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    authUrl:env.jd_bind + encodeURIComponent(env.jd_bind_back) + '#wechat_redirect'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
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
    this.init();
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
  /**
   * 京东授权url设置
   */
  init()
  {
    let jdAuthUrl = env.jd_bind;
    let backUrl = env.jd_bind_back;
    this.setData({
      authUrl:jdAuthUrl + encodeURIComponent(backUrl) + '#wechat_redirect'
    });
  }
});