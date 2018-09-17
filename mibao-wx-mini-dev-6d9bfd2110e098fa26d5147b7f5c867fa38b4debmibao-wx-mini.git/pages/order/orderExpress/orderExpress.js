// 订单追踪
import orderApi from '../../../api/order.js';
import env from '../../../config/env.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    channel: '',  // user查询用户接收快递信息 ，merchant 查询商户接收快递信息
    logisticsMsg: {
      img:"",
      logisticsCompany: "",
      expressNo: "",
      info:[],
      userReceiveInfoBean:{}
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(options.id) {
      this.setData({
        id: options.id,
        channel: options.channel || 'user'
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getLogistics();
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
  // 获取物流信息 
  getLogistics() {
    if(!this.data.id) {
      return ;
    }
    let params = {
      id: this.data.id,
      channel: this.data.channel
    };
    orderApi.orderLogisticsInfo(params).then(resp => {
      console.log(resp)
      if (resp.code == 200) {
        let data = resp.data || {};
        data.img =  env.image_host + resp.data.img;
        data.info = this.formateInfo(resp.data.info||[]);
        data.userReceiveInfoBean = resp.data.userReceiveInfoBean || {};
        this.setData({
          logisticsMsg: data
        });
      } else {
        this.$toast(resp.message);
      }
    }).catch(e => {
      this.$networkErr(e);
    });
  },
  // 格式化物流信息
  formateInfo(infoList) {
    for(let i=0;i<infoList.length;i++) {
      infoList[i].ftime1 = (infoList[i].ftime || '').slice(0,10);
      infoList[i].ftime2 = (infoList[i].ftime || '').slice(-8, -3);
    }
    console.log(infoList)
    return infoList;
  },
  /*
   * 复制物流单号
   */
  copyLogistics: function () {
    wx.setClipboardData({
      data: this.data.logisticsMsg.expressNo,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
})