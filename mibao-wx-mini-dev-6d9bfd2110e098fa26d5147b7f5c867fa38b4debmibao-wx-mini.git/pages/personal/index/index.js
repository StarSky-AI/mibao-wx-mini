//背景图
import background from '../../../images/base64/background.js';
//系统默认用户头像
import DefaultUserImg from '../../../images/base64/DefaultUserImg.js';
//已实名认证图标
import authentication from '../../../images/base64/authentication.js';

import personalApi from '../../../api/personal.js';

Page({
  /**
   * 页面的初始数据
   */
  data:{
    //完善资料开关
    perfectData: true,
    //背景图片
    background: background,
    //判断是否登录 false未登录状态
    LoggedIn: false,
    //系统默认用户头像
    DefaultUserImg: DefaultUserImg,
    
    //用户已登录状态图标
    UserStatus: {
      //用户头像
      UserImg: '',
      //用户名称
      UserName: '蜜小宝'
    },
    //实名认证状态 0未认证
    Certified: 0,
    //未实名认证
    uncertified: '立即认证',
    //已实名认证
    authentication: authentication,
    //已登录的进行中，未完成，已取消
      going: '0',
      finished: '10',
      canceled: '100'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    this.init();
    this.getTestData()
    
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
   * 用户点击右上角转发
   */
  onShareAppMessage: function () {

  },

  /**
   * 页面滚动触发事件的处理函数
   */
  onPageScroll: function () {

  },
  init()
  {
      this.$login().then((data)=>{
          let LoggedIn = this.data.LoggedIn;
          let UserImg = this.data.UserStatus.UserImg;
          let UserName = this.data.UserStatus.UserName;
          this.setData({
              LoggedIn: true,
              UserImg: data.userInfo.avatarUrl,
              UserName: data.userInfo.nickName
          })
          personalApi.getInformation().then(resp=>{
            console.log(resp);
          })


      });
  },


  /**
   * 当前是 tab 页时，点击 tab 时触发
   */
  onTabItemTap: function(item) {

  },
    //点击登录
    login: function() {
      this.init();
    },
  //点击跳转到完善资料页面
  goPerfectData: function() {
    wx.navigateTo({
      url: '/pages/personal/PerfectInformation/PerfectInformation'
    })
  },
  //点击跳转至优惠券页面
  coupon: function() {
    wx.navigateTo({
      url: '/pages/personal/coupon/coupon'
    })
  },
  //点击跳转至我的收藏页面
  favorite: function() {
    wx.navigateTo({
      url: '/pages/personal/favorite/favorite'
    })
  },
  //点击跳转至地址新增列表页面
  addressList: function() {
    wx.navigateTo({
      url: '/pages/personal/addressList/addressList'
    })
  },
  //点击跳转至我的客服页面
  service: function() {
    wx.navigateTo({
      url: '/pages/personal/service/service'
    })
  },
  //获取全部数据
  getTestData:function() {
      let that = this;
      let going = that.data.going;
      let finished = that.data.finished;
      let canceled = that.data.canceled;
      //未完成、已完成、已取消订单接口
      personalApi.OrderClassification().then(resp=>{
        console.log(resp);
        that.setData({
            going: resp.data.runningNum,
            finished: resp.data.finishedNum,
            canceled: resp.data.canceledNum
        })

      });
  },
    toOrder(e){
        let state=e.currentTarget.dataset.type;
        wx.setStorageSync(
            'orderListTab',state
        );
        wx.navigateTo({
            url:"/pages/order/orderList/orderList"
        })
    }
})