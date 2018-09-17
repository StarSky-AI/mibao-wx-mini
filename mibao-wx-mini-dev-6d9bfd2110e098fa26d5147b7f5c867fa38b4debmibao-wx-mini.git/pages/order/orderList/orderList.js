// “我的订单”
import orderApi from '../../../api/order.js';
import env from '../../../config/env.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderLists: [],
    pageNum:1,    // 列表页数
    pageSize:10,  // 列表每页数量
    hasMore:true,
    hide:true,       // 加载中...
    orderType:'leasing',
    scrollY: true,
    scrollTop:0,
    depositModal: true,
    payDepositInfo:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let orderType = options.type;
    let _this = this;
    wx.getStorage({
      key: 'orderListTab',
      success: function (res) {
        _this.setData({
          orderType: orderType || res.data
        });
      },
      complete: function () {
        _this.getOrders();
      }
    });
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
    console.log("下拉刷新");
    this.setData({
      hasMore: true,
      pageNum: 1,
      scrollTop: 0,
    });
    this.getOrders();
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 500);
  },
  refresh() {
    console.log('refresh');
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
  /*
    加载更多
  */
  loadMore: function () {
    this.getOrders();
  },
  // 订单--进行中
  getLeasingOrders: function() {
    this.setData({
      orderType: 'leasing',
      hasMore:true,
      pageNum:1,
      scrollTop: 0,
    });
    wx.setStorage({
      key: "orderListTab",
      data: "leasing"
    });
    this.getOrders();
  },
  // 订单--已完成
  getFinishedOrders: function () {
    this.setData({
      orderType: 'finished',
      hasMore: true,
      pageNum: 1,
      scrollTop: 0,
    });
    wx.setStorage({
      key: "orderListTab",
      data: "finished"
    });
    this.getOrders();
  },
  // 订单--已取消
  getCanceledOrders: function () {
    this.setData({
      orderType: 'canceled',
      hasMore: true,
      pageNum: 1,
      scrollTop: 0,
    });
    wx.setStorage({
      key: "orderListTab",
      data: "canceled"
    });
    this.getOrders();
  },
  // 获取接口订单
  getOrders: function () {
    console.log('getAllOrders');
    if (!this.data.hasMore) {
      console.log('加载完成');
      return ;
    }
    this.setData({
      hide: false,
    });
    let data = {
      "pageNum": this.data.pageNum,
      "pageSize": this.data.pageSize,
      "type": this.data.orderType
    };
    orderApi.orderAllList(data).then(resp => {
      console.log('resp');
      console.log(resp)
      if(resp.code == 200) {
        if (resp.data.list.length < this.data.pageSize) { // 没有更多了
          console.log('没有更多了')
          this.setData({
            hasMore: false,
          });
        }
        let data = resp.data || {};
        console.log(this.data.pageNum)
        let list = this.data.pageNum == 1 ? this.formatLists(resp.data.list || []) : this.data.orderLists.concat(this.formatLists(resp.data.list || []));
        this.setData({
          orderLists: list,
          pageNum: this.data.pageNum + 1
        });
        console.log(this.data.orderLists);
      } else {
        this.$toast(resp.message);
      }
      this.setData({
        hide: true
      });
    }).catch(e => {
      this.$networkErr(e);
      this.setData({
        hide: true
      });
    });
  },
  // 格式化list数据
  formatLists : function(lists) {
    if(!lists) {
      return [];
    } 
    for (let i = 0; i < lists.length; i++) {
      lists[i].goodsImage = env.image_host + lists[i].goodsImage;
      lists[i].standard = this.skuFormat(lists[i].standard);
      lists[i].delayAmount = this.formatPrice(lists[i].delayAmount); //delayAmount 逾期费用
      lists[i].deposit = this.formatPrice(lists[i].deposit);     //deposit 押金
      lists[i].firstPay = this.formatPrice(lists[i].firstPay);    //firstPay 首期租金
    }
    return lists;
  },
  // 格式化sku
  skuFormat: function(skuLists) {
    let str = '';
    for (let i = 0; i < skuLists.length; i++) {
      str += skuLists[i].name + '丨';
    }
    return str.slice(0, str.length - 1);
  },
  // 格式化商品价格 
  formatPrice(price) {
    if (!price) {
      return parseFloat(0).toFixed(2);
    }
    if ((price + '').slice((price + '').length-2)>0) {
      return parseFloat(price / 100).toFixed(2);
    } else {
      return price/100;
    }
  },
  // 跳转订单详情页
  goOrderDetail: function(e) {
    console.log(e)
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id=' + id
    });
  },
  // 提前归还/立即归还
  goOrderReturn(e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../orderDetail/orderDetail?id=' + id
    });
  },

  //押金弹框 弹起
  showDepositModal(e){
    console.log(e)
    let info = e.currentTarget.dataset.info;
    console.log(info);
    this.setData({
      depositModal:false,
      scrollY:false,
      payDepositInfo: info
    });
  },
  //押金支付：我再想想  关闭
  closeDepositModal() {
    this.setData({
      depositModal: true,
      scrollY: true,
    });
  },
  //  押金支付：调起申请极速租赁  支付
  payDeposit(){
    orderApi.applyDepositPay({ id: this.data.payDepositInfo.id}).then(resp=>{
      if(resp.code==200) {
        console.log(resp);
        wx.navigateTo({
          url: `/pages/order/orderPay/orderPay?id=${this.data.payDepositInfo.id}&payType=deposit&state=${this.data.payDepositInfo.state}&goodsId=${this.data.payDepositInfo.goodsId}`
        });
        this.closeDepositModal();
        this.onPullDownRefresh();
      } else {
        this.$toast(resp.message);
      }
    }).catch(err => {
        this.$networkErr(err);
    })
  },
  // 催促发货
  orderReminder(e) {
    let state=e.currentTarget.dataset.state,
        id=e.currentTarget.dataset.id,
        reminded=e.currentTarget.dataset.reminded;//true 可以显示按钮

      if(state=='pending_send_goods' && reminded){
          orderApi.urgeDeliver({id:id})
              .then(resp=>{
                  if(resp.code==200)
                  {
                      this.$toast("亲爱的蜜友已为您催促发货中，感谢您的耐心等待")
                      this.setData({
                          hasMore: true,
                          pageNum: 1,
                          scrollTop: 0,
                      });
                      this.getOrders();
                  }
              }).catch(err=>{
              this.$networkErr(err)
          });
      }
  },
  // 确认收货
  showReceiveModel(e) {
    let id = e.currentTarget.dataset.id;
    console.log(id);
    let _this = this;
    wx.showModal({
      title: '确认收货？',
      content: '是否确认收货？',
      success: function (res) {
        if (res.confirm) {
          _this.receiveOrder(id);
          this.onPullDownRefresh();
        } else if (res.cancel) {
          //console.log('用户点击取消')
        }
      }
    });
  },
  receiveOrder(id) {
    orderApi.confirmReceipt({ id: id }).then(resp => {
      if (resp.code == 200) {
        console.log(resp);
        this.$toast(resp.data);
      } else {
        this.$toast(resp.message);
      }
    }).catch(err => {
      this.$networkErr(err);
    });
  },
  // 待支付状态--支付 
  payOrder(e) {
    console.log(e.currentTarget.dataset)
    let id = e.currentTarget.dataset.id;
    let deposit = e.currentTarget.dataset.deposit;
    let state = e.currentTarget.dataset.state;
    let goodsId = e.currentTarget.dataset.goodsid;
      if (deposit!=='0.00') {
      // 跳转押金支付页面
      let url = '/pages/order/orderPay/orderPay?id=' + id + '&payType=deposit&state=' + state + '&goodsId=' + goodsId;
      console.log(url)
      wx.navigateTo({
        url: url
      });
    } else {
      // 跳转订单详情页
      wx.navigateTo({
        url: '../orderDetail/orderDetail?id=' + id
      });
    }
  }
})