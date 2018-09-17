// 分期账单
import orderApi from '../../../api/order.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: 0,
    state:'',
    goodsId:'',
    accidentInsurance:'', // 租赁保障
    orderPaymentBeanList:[
      // {
      //   "currentPeriodLeaseTerm": 0,
      //   "dailyRent": 0,
      //   "voucherDiscount": 0,
      //   "paymentState": "paid",
      //   "paymentStateStr": "已支付",
      //   "totalAmount": 1000,
      //   "delayAmount": 100,    
      //   "lastPayTime": 1533966582127,
      //   "paidAmount": 1100,
      //   "currentPeriod": "1/12"
      // }
    ],
    payBtnTxt:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        id: options.id
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getOrderBill();
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
  // 点击展开账单详情
  spreadToggle(e) {
    let index = e.currentTarget.dataset.index;
    let item = 'orderPaymentBeanList['+index+'].spread';
    this.setData({
      [item]: !(this.data.orderPaymentBeanList[index].spread||false)
    });
  },
  // 获取分期账单
  getOrderBill() {
    if(!this.data.id) {return;}
    orderApi.getOrderInfo({id:this.data.id}).then(resp => {
      if (resp.code == 200) {
        let data = resp.data||{};
        let btnTxt = '';
        if ((data.state == 'running' || data.state == 'running_overdue') && data.nextPayNum) {  // 租赁中/逾期租赁 状态下可以支付租金
          if ((data.orderLeaseInfo || {}).currentPeriodPaid) {
            btnTxt = '提前支付第' + data.nextPayNum + '期租金';
          } else {
            btnTxt = '支付第' + data.nextPayNum + '期租金';
          }
        }
        this.setData({
          orderPaymentBeanList: this.formatData(data.orderPaymentBeanList || {}),
          payBtnTxt: btnTxt,
          state:data.state,
          goodsId: data.goodsId,
          accidentInsurance: (data.accidentInsurance/100).toFixed(2)
        });
      } else {
        this.$toast(resp.message);
      }
    }).catch(e => {
      this.$networkErr(e);
    });
  },
  formatData(billList) {
    for(let i=0; i<billList.length; i++) {
      billList[i].currentPeriod1 = this.add0(billList[i].currentPeriod.split('/')[0]);
      billList[i].currentPeriod2 = this.add0(billList[i].currentPeriod.split('/')[1]);
      billList[i].realAmount = ((billList[i].totalAmount - billList[i].voucherDiscount || 0) / 100).toFixed(2);  // 实际租金
      billList[i].totalAmount = (billList[i].totalAmount / 100).toFixed(2);          // 首期租金
      billList[i].delayAmount = (billList[i].delayAmount / 100).toFixed(2);          // 逾期金额
      billList[i].voucherDiscount = (billList[i].voucherDiscount / 100);  // 优惠礼券
      billList[i].dailyRent = (billList[i].dailyRent / 100).toFixed(2);              // 每日租金
      billList[i].lastPayTime = this.formatDate(billList[i].lastPayTime);              // 支付期限
    }
    return billList;
  },
  add0(num) {
    if(num<10) { return '0'+num;} 
    else {return num }
  },
  floatPrice(price) {
    if (type && type == 'int') {
      return parseInt(price / 100);
    } else if (type && type == 'fixed') {
      return (price / 100 - parseInt(price / 100)).toFixed(2).slice(2);
    } else {
      return (price / 100).toFixed(2);
    }
    return price;
  },
  formatDate(timestamp) {
    if (!timestamp) {  return false; }
    let time = new Date(timestamp);
    let year = time.getFullYear();
    let month = time.getMonth() + 1;
    let date = time.getDate();
    return  year + '-' + this.add0(month) + '-' + this.add0(date);
  },
  // 账期支付 跳转支付页面
  payment() {
    wx.navigateTo({
      url: `/pages/order/orderPay/orderPay?id=${this.data.id}&payType=&state=${this.data.state}&goodsId=${this.data.goodsId}`
    });
  },
})