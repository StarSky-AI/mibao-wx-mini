// pages/order/orderPay/orderPay.js
import orderApi from "../../../api/order";

Page({

  /**
   * 页面的初始数据
   */
  data: {
    payType:'',//租金支付还是押金支付
      orderId:'',
      useCoupon:true,
      choosedCouponPrice:0,
      couponId:'',
      goodsId:'',
      state:'',
      couponList:[],
      merchantcouponList:[],
      scrollY:true,
      payInfo:{},//支付信息
      factualMoney:0,//实付金额
      orderBonusPrice:0,//下单优惠券金额
      youhuijine:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    this.setData({
        payType:options.payType,
        orderId:options.id,
        goodsId:options.goodsId,
        state:options.state
    });
      this.getPayDetail();
      if(this.data.payType=='deposit')
      {
          wx.setNavigationBarTitle({ title: '押金支付' })
      }
      else
      {
        wx.setNavigationBarTitle({ title: '租金支付' })

      }
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
    setPayMoney(){
        let money=0;
            let canUseCouponMoney=0;//   除去押金后本期应付的  这部分可以使用优惠券
            let youhuiquanjine=0;//优惠券金额
            let youhuijine=0;//用优惠券优惠的金额
            let deposit=this.data.payInfo.deposit/100;//押金 只有首期有
            canUseCouponMoney=this.data.payInfo.totalAmount/100-deposit;

            if(this.data.orderBonusPrice)
            {
                youhuiquanjine=this.data.orderBonusPrice;
            }
            else
            {
                youhuiquanjine=this.data.choosedCouponPrice;
            }

            youhuijine=canUseCouponMoney>youhuiquanjine?youhuiquanjine:canUseCouponMoney;
            //实付款
            money=((canUseCouponMoney>youhuiquanjine?(canUseCouponMoney-youhuiquanjine):0)+deposit).toFixed(2);

        this.setData({
            factualMoney: money,
            youhuijine:youhuijine,
        })
    },
    couponChoose(){
        this.selectComponent("#couponlist").showModal();
    },
    getMyCoupon(){
      return new Promise((resolve)=>{
          //押金支付首期 下单没用优惠券 才可以给他选择
          if(!this.data.payInfo.orderBonus && this.data.payType=='deposit')
          {
              orderApi.getMyCoupon({goodsId:this.data.goodsId})
                  .then(resp=>{
                      if(resp.code==200)
                      {
                          let data=resp.data||{};
                          let couponList=data.managerUserBonusList||[];
                          let merchantcouponList=data.merchantUserBonusList||[];
                          this.setData({
                              couponList:couponList,
                              merchantcouponList:merchantcouponList,
                          })
                          let choosedCouponPrice=0,
                              couponId='';
                          if(couponList.length && merchantcouponList.length)
                          {
                              choosedCouponPrice=couponList[0].price/100>merchantcouponList[0].price/100?couponList[0].price/100:merchantcouponList[0].price/100;
                              couponId=couponList[0].price/100>merchantcouponList[0].price/100?couponList[0].id:merchantcouponList[0].id;
                          }
                          else if(couponList.length)
                          {
                              choosedCouponPrice=couponList[0].price/100;
                              couponId=couponList[0].id;
                          }
                          else if(merchantcouponList.length)
                          {
                              choosedCouponPrice=merchantcouponList[0].price/100;
                              couponId=merchantcouponList[0].id;
                          }
                          else {
                              choosedCouponPrice=0;
                              couponId='';
                          }
                          this.setData({
                              choosedCouponPrice:choosedCouponPrice,
                              couponId: couponId
                          });
                        resolve();
                      }
                      else if(resp.code==401)
                      {
                          this.$login().then(()=>{
                              this.getMyCoupon().then(()=>{
                                  //    下单没有优惠券
                                  this.setPayMoney();
                              }).catch(()=>{
                                  this.setPayMoney();
                              });;
                          });
                      }
                      else
                      {
                          this.$toast(resp.message)
                      }
                  }).catch(e=>{
                  this.$networkErr(e);
              })
          }
          else
          {
              resolve()
          }
      })


    },
    couponSelect(e){
        if(this.data.useCoupon)
        {
            //  传递优惠券的值
            let couponId=e.currentTarget.dataset.id;
            let choosedCouponPrice=e.currentTarget.dataset.price;
            this.selectComponent("#couponlist").hideModal();
            this.setData({
                choosedCouponPrice:choosedCouponPrice,
                couponId:couponId,
            });
            this.setPayMoney();
        }
    },
    disableScroll(obj){
        //  禁止页面滚动
        this.setData({
            scrollY:obj.detail.hideModal
        })
    },
    useCoupon(){
        this.setData({
            useCoupon:!this.data.useCoupon
        });
        if(!this.data.useCoupon)
        {
            this.setData({
                choosedCouponPrice:0,
                couponId:'',
            });
            this.selectComponent("#couponlist").hideModal();
            this.setPayMoney();
        }
    },
    getPayDetail(){
        //支付详情
        orderApi.detailPay({id:this.data.orderId}).then(resp=>{
            if(resp.code==200)
            {
                console.log(resp);
                let data=resp.data||{};
                let orderBonusPrice=0;
                if(data.orderBonus)
                {
                    orderBonusPrice=data.orderBonus.price/100;
                }
                this.setData({
                    payInfo:data,
                    orderBonusPrice:orderBonusPrice
                });
                this.getMyCoupon().then(()=>{
                //    下单没有优惠券
                    this.setPayMoney();
                }).catch(()=>{
                    this.setPayMoney();
                });
            }
        }).catch(err=>{
            this.$networkErr(err)
        })
    },
    pay(){
      const _this=this;
        let data=
            {
                id:_this.data.orderId,
                "userBonusId": _this.data.couponId,
            };
        if(this.data.payType=='deposit')
        {
        //    押金支付 即订单支付
            orderApi.orderPay(data)
                .then(resp=>{
                    console.log(resp);
                    if(resp.code==200)
                    {
                        let data=resp.data
                        console.log(data);
                       _this.callWXPay(_this,data);
                    }

                })
                .catch(err=>{
                    this.$networkErr(err)
                })
        }else
        {
        //    账期支付 第二期以后 不可以用优惠券
            //    账期支付
            orderApi.billPay(data)
                .then(resp=>{
                    console.log(resp);
                    if(resp.code==200)
                    {
                        let data=resp.data||{};
                        console.log(data);
                        _this.callWXPay(_this,data)
                    }
                    else
                    {
                        _this.$toast(resp.message)
                    }
                })
                .catch(err=>{
                    _this.$networkErr(err)
                })
        }

    },
    callWXPay(_this,data){
        wx.requestPayment({
            'timeStamp': data.timeStamp,
            'nonceStr': data.nonceStr,
            'package': data.packageValue,
            'signType': data.signType,
            'paySign': data.paySign,
            'success':function(res){
                console.log(res);
                wx.navigateTo({
                    url:`/pages/order/orderDetail/orderDetail?id=${_this.data.orderId}`
                });
            },
            'fail':function(res){

                orderApi.orderCancelPay({id:_this.data.orderId})
                    .then(resp=>{
                        if(resp.code==200)
                        {
                            wx.navigateTo({
                                url:`/pages/order/orderDetail/orderDetail?id=${_this.data.orderId}`
                            });
                        }
                        else {
                            _this.$toast(resp.message)
                        }

                    })
                    .catch(err=>{
                        _this.$networkErr(err)
                    })
            }
        })
    }
});