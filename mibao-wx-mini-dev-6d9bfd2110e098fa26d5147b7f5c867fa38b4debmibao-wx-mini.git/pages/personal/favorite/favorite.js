// pages/personal/favorite/favorite.js
import personalApi from '../../../api/personal.js';
import env from '../../../config/env';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    //蒙版
    Maskhidden: false,
    //定义切换信号量
    currentTab: 0,
    //头部选项卡
    switchtab: [{
      name: '商品'
    },
      {
        name: '店铺'
      }],
    //区分点击的是哪个数组
    modifilyObj: '',
    modifilyIndex: 0,
    //商品列表数据
    shopList: [],
    // 店铺列表数据
    storeList: [],
    imgHost:env.image_host,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
    });
    that.setData({
      Maskhidden: false,
    })
    //获取数据
    this.getTestData();
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
  //点击切换选项卡
  clickTab: function (e) {
    let that = this;
    var index = e.target.dataset.current;
    if (that.data.currentTab == index)
    {
      return false;
    } else
    {
      that.setData({
        currentTab: index
      })
    }
  },
  //点击删除商品
  RemoveShop: function (e) {
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let shopList = this.data.shopList;
    console.log(shopList)
    console.log(id, index)
    let that = this;
    wx.showModal({
      title: '提示',
      content: '您确定删除该商品吗？',
      success: function (e) {
        if (e.confirm)
        {
          personalApi.removeShop({
            id: id
          }).then(resp => {
            if (resp.code == 200)
            {
              shopList.splice(index, 1)
              
              that.setData({
                shopList: shopList
              })
              console.log(shopList);
            }
          })
        } else
        {
          console.log(e.confirm)
        }
      }
    })
  },
  //点击取消店铺
  RemoveStore: function (e) {
    let that = this;
    let id = e.currentTarget.dataset.id;
    let index = e.currentTarget.dataset.index;
    let storeList = this.data.storeList;
    wx.showModal({
      title: '提示',
      content: '您确定取消关注吗？',
      success: function (e) {
        if (e.confirm)
        {
          personalApi.removeStore({
            id: id
          }).then(resp => {
            if (resp.code == 200)
            {
              storeList.splice(index, 1);
              that.setData({
                storeList: storeList
              })
              console.log(storeList);
            }
          })
        } else
        {
          console.log(e.confirm)
        }
      }
    })
  },
  //获取全部数据
  getTestData: function () {
    let that = this;
    //查看我的商品收藏列表接口请求
    personalApi.getshopList().then(resp => {
      if (resp.code == 200)
      {
        console.log(resp);
        that.setData({
          Maskhidden: true
        })
        wx.hideLoading();
        let shopList = resp.data || null;
        that.setData({
          shopList: shopList
        });
      }
    });
    //查看我的收藏店铺列表
    personalApi.getstoreList().then(resp => {
      that.setData({
        Maskhidden: true
      })
      wx.hideLoading();
      if (resp.code == 200)
      {
        console.log(resp);
        let storeList = resp.data || null;
        that.setData({
          storeList: storeList
        })
      }
    });
  }
})