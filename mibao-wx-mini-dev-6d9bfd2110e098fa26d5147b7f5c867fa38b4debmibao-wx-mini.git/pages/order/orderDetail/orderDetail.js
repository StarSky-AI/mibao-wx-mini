// pages/order/orderDetail/orderDetail.js
import orderApi from "../../../api/order";
import env from "../../../config/env";
import merchantApi from "../../../api/merchant";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        channel: 'user',  // user查询用户接收快递信息 ，merchant 查询商户接收快递信息
        hideCompensateModal:true,
        loadingHide:true,
        hideCouponList:true,
        useCoupon:true,
        orderId:'',
        orderInfo:{},//订单信息
        goodsInfo:{},//模板传递的信息
        animationData:{},//展开收起
        showDetailTop:false,//上部分账单内容 默认展开
        showDetailBottom:false,//订单总额 默认隐藏
        orderLeaseInfo:{},//租赁信息
        overdueModal:true,//租赁逾期说明
        orderCompensateInfo:{},//赔偿信息
        money:0,//最下方显示的支付金额
        couponList:[],//商品优惠券
        merchantcouponList:[],//商户优惠券
        choosedCouponPrice:0,//选择的优惠券金额
        scrollY:true,//页面蝌蚪滚动
        compensateImageList:[],
        depositModal:true,//押金确认弹框
        compensateS:[],//拒绝赔偿进度
        isSelectDisposablePayment:true,//默认全款
        couponId:'',//优惠券id
        payInfo:{},//支付详情
        factualMoney:0,//实际支付的金额
        youhuijine:0,//本期应付总额-押金  使用优惠券的优惠金额
        showUserCompensate:true,
        proof:{},//用户举证
        logisticsMsg:{},//物流信息
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if(options.id)
        {
            this.setData({
                orderId:options.id,
            });
            this.getOrderInfo();
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
    getOrderInfo(){
        orderApi.getOrderInfo({id:this.data.orderId})
            .then(resp=>{
                console.log(resp.code==200);
                if(resp.code==200)
                {
                    console.log(resp);
                    let data=resp.data||{};
                    let goodsInfo={};
                    goodsInfo.goodsName=data.goodsName;
                    goodsInfo.specification=data.specification;
                    if(data.image.indexOf('http')==-1)
                    {
                        data.image=env.image_host+data.image;
                    }
                    goodsInfo.image= data.image;
                    goodsInfo.leaseNum=data.leaseNum;
                    goodsInfo.originalPrice=data.price;
                    goodsInfo.goodsId=data.goodsId;
                    if(data.orderCompensateInfoBean)
                    {
                        data.orderCompensateInfoBean.image=data.orderCompensateInfoBean.image||[];
                        data.orderCompensateInfoBean.image.forEach(item=>{
                            if(item.url.indexOf('http')==-1)
                            {
                                item.url=env.image_host+item.url;
                            }
                        });
                    }

                    this.setData({
                        orderInfo:data,
                        goodsInfo:goodsInfo,
                        orderLeaseInfo:data.orderLeaseInfo,
                        orderCompensateInfo:data.orderCompensateInfoBean||{},
                    });

                    //待收货 物流
                    if(data.state=='pending_receive_goods')
                    {
                        this.setData({
                            channel:'user'
                        });
                        this.getExpress();
                    }
                    //还机中 物流
                    if(data.state=='returning')
                    {
                        this.setData({
                            channel:'merchant'
                        });
                        this.getExpress();
                    }
                    //待支付状态如果未选择优惠券 金额为0
                    // 可以选择  待支付
                    if(this.data.orderInfo.state=='pending_pay'&& this.data.orderLeaseInfo.voucherDiscount==0)
                    {
                        this.getMyCoupon();
                    }
                    else {
                        this.setPayMoney();
                    }



                }
                else if(resp.code==401)
                {
                    this.$login().then(()=>{
                        this.getOrderInfo();
                    });
                }
                else
                {
                    this.$toast(resp.message)
                }
            })
            .catch(e=>{
                this.$networkErr(e);
            })
    },
    couponSelect(e){
        if(this.data.useCoupon)
        {
            //  传递优惠券的值
            let choosedCouponPrice=e.currentTarget.dataset.price;
            let couponId=e.currentTarget.dataset.id;
            this.selectComponent("#couponlist").hideModal();
            this.setData({
                choosedCouponPrice:choosedCouponPrice,
                couponId:couponId,
            });
            this.setPayMoney()
        }

    },
    getMyCoupon(){
        orderApi.getMyCoupon({goodsId:this.data.orderInfo.goodsId})
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
                    this.setPayMoney()
                }
                else if(resp.code==401)
                {
                    this.$login().then(()=>{
                        this.getMyCoupon();
                    });
                }
                else
                {
                    this.$toast(resp.message)
                }
            }).catch(e=>{
            this.$networkErr(e);
        })
    },
    setPayMoney(){
        //带赔偿
        if(this.data.orderInfo.state=='pending_compensate_check'|| this.data.orderInfo.state=='pending_user_compensate')
        {
            this.setData({
                factualMoney:(this.data.orderCompensateInfo.compensateAmount/100).toFixed(2)
            });
            return;
        }
        //退还逾期
        if(this.data.orderInfo.state=='return_overdue')
        {
            this.setData({
                factualMoney:(this.data.orderInfo.delayAmount/100).toFixed(2)
            });
            return;
        }

        let money=0;//实付金额
        let currentRent=0;//租金金额
        let canUseCouponMoney=0;//   除去押金后本期应付的  这部分可以使用优惠券
        let youhuijine=0;//用优惠券优惠的金额
        let deposit=0;//押金
        //待支付和支付租金
        if(this.data.orderInfo.state=='pending_pay'||this.data.orderInfo.state=='running')
        {
            //支付的金额
            let needPay=(this.data.orderLeaseInfo.currentPeriodTotalAmount/100)-(this.data.orderLeaseInfo.voucherDiscount/100)-this.data.choosedCouponPrice;

            console.log(needPay);
            money=needPay<0?'0.00':needPay.toFixed(2)
            console.log(money);
            if(this.data.orderInfo.nextPayNum==1)
            {
                deposit=this.data.orderLeaseInfo.deposit/100;
            }
            //首期减去 有押金 减去押金
            let canUseCouponMoney=this.data.orderLeaseInfo.currentPeriodTotalAmount/100-(this.data.orderInfo.nextPayNum==1?deposit:0);
            console.log(canUseCouponMoney);
            let youhuiquanjine=0;//优惠券金额
            if(this.data.orderLeaseInfo.voucherDiscount && this.data.orderInfo.state=='pending_pay')
            {
                youhuiquanjine=this.data.orderLeaseInfo.voucherDiscount/100;
            }
            else
            {
                youhuiquanjine=this.data.choosedCouponPrice;
            }
            console.log(youhuiquanjine);
            //省下来的钱
            youhuijine=canUseCouponMoney>youhuiquanjine?youhuiquanjine:canUseCouponMoney;


            console.log(youhuijine);
        }
        this.setData({
            youhuijine:youhuijine.toFixed(2),
            factualMoney: money,
        })
    },
    toOrderExpress(){
        wx.navigateTo({
            url:`/pages/order/orderExpress/orderExpress?id=${this.data.orderId}&channel=${this.data.channel}`
        })
    },
    getExpress(){
        //最新物流信息
        let params = {
            id: this.data.orderId,
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
    callphone(){
        wx.makePhoneCall({
            phoneNumber: this.data.orderInfo.orderMerchantInfoBean.contactNumber//仅为示例，并非真实的电话号码
        })
    },
    copy(){
        const _this=this;
        wx.setClipboardData({
            data: _this.data.orderLeaseInfo.orderNumber,
            success: function(res) {
                wx.hideToast();
                _this.$toast("复制成功")
            }
        })
    },
    toXieYi(){
        wx.navigateTo({
            url:`/pages/order/orderDetail/rentAgreement/rentAgreement?id=${this.data.orderId}`
        })
    },
    toInstalmentInfo(){
        // 分期账单
        wx.navigateTo({
            url:`/pages/order/orderBill/orderBill?id=${this.data.orderId}`
        })
    },
    zhanKaiBottom(){
        this.setData({
            showDetailBottom:!this.data.showDetailBottom,
        })
    },
    zhanKaiTop(){
        this.setData({
            showDetailTop:!this.data.showDetailTop,
        })
    },
    compensateDetail(){
        //  赔偿详情
        this.selectComponent("#compensateDetail").showModal();
    },
    toSaveGuard(){
        let orderMerchantInfoBean=this.data.orderInfo.orderMerchantInfoBean||{};
        //  赔偿申诉
        wx.navigateTo({
            url:`/pages/order/orderCompensate/compensateApply/compensateApply?id=${this.data.orderId}&goodsInfo=${JSON.stringify(this.data.goodsInfo)}&MerchantInfo=${JSON.stringify(orderMerchantInfoBean)}`
        });

    },
    saveSchedule() {
        //  赔偿进度
        const _this = this;
        _this.setData({
            loadingHide: false
        });
        orderApi.refuseCompensateDetail({id:_this.data.orderId})
            .then(resp=>{
                if(resp.code==200)
                {
                    let data=resp.data||{};
                    console.log(resp);
                    _this.setData({
                        compensateS:data.compensateProgress,
                    })
                }
            }).catch(err=>{
            _this.$networkErr(err)
        });
        setTimeout(()=>{
            _this.setData({
                loadingHide: true,
                hideCompensateModal:false,
                scrollY:false
            });
        },20)


    },
    couponChoose(){
        this.selectComponent("#couponlist").showModal();
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
    showNote(){
        if(this.data.orderInfo.state=='running_overdue'||this.data.orderInfo.state=='return_overdue')
        {
            this.setData({
                overdueModal:false,
                scrollY:false,
            });
        }
    },
    toComment(){
        let finish=this.data.orderLeaseInfo.commented;
        wx.navigateTo({
            url:`/pages/comment/common/common?id=${this.data.orderId}&finish=${finish}&goodsInfo=${JSON.stringify(this.data.goodsInfo)}`
        });
    },
    toReturn(){
        let merchantInfo=this.data.orderInfo.orderReturnMerchantInfoBean;
        wx.navigateTo({
            url:`/pages/order/orderReturn/orderReturn?id=${this.data.orderId}&merchantId=${merchantInfo.merchantId}&contact=${merchantInfo.contact}&contactNumber=${merchantInfo.phone}&receiveAddress=${merchantInfo.receiveAddress}&merchantName=${this.data.orderInfo.merchantName}`
        });
    },
    closeDepositModal(){
        //我再想想  关闭
        this.setData({
            depositModal:true,
            scrollY:true,
        });
    },
    showDepositModal(){
        //押金弹框 弹起
        this.setData({
            depositModal:false,
            scrollY:false,
        });


    },
    payDeposit(){
        //  掉起申请极速租赁  支付
//  押金支付
        orderApi.applyDepositPay({id:this.data.orderId})
            .then(resp=>{
                if(resp.code==200)
                {
                    console.log(resp);
                    wx.navigateTo({
                        url:`/pages/order/orderPay/orderPay?id=${this.data.orderId}&payType=deposit&state=${this.data.orderInfo.state}&goodsId=${this.data.orderInfo.goodsId}`
                    });
                }
            })
            .catch(err=>{
                this.$networkErr(err);
            })

    },
    //押金待支付详情直接支付
    depositOrderPay(){
        wx.navigateTo({
            url:`/pages/order/orderPay/orderPay?id=${this.data.orderId}&payType=deposit&state=${this.data.orderInfo.state}&goodsId=${this.data.orderInfo.goodsId}`
        });
    },
    cancelOrder(){
        //  取消订单
        wx.navigateTo({
            url:`/pages/order/orderCancel/orderCancel?id=${this.data.orderId}`
        });
    },
    urgeExpress(){
        //  催促发货
        if(this.data.orderInfo.reminded){
            //    可以催促发货
            orderApi.urgeDeliver({id:this.data.orderId})
                .then(resp=>{
                    if(resp.code==200)
                    {
                        this.$toast("亲爱的蜜友已为您加急催促发货，感谢您的耐心等待")
                       this.getOrderInfo();
                    }
                }).catch(err=>{
                this.$networkErr(err)
            });
        }
    },
    receiveGood(){
        //  确认收货
        const _this=this;
        wx.showModal({
            title: '提示',
            content: '确定已经收到商品了吗？',
            success: function(res) {
                if (res.confirm) {
//    收藏
                    orderApi.confirmReceipt({id:_this.data.orderId})
                        .then(resp=>{
                            if(resp.code==200)
                            {
                                _this.$toast('确认收货成功')
                                _this.getOrderInfo();
                            }
                            else if(resp.code==401)
                            {
                                //    请先登录
                                _this.$login().then(()=>{
                                    _this.receiveGood();
                                });
                            }
                            else
                            {
                                _this.$toast(resp.message)
                            }
                        })
                        .catch(err=>{
                            _this.$networkErr(err);
                        })
                } else if (res.cancel) {

                    console.log('用户点击取消')
                }
            }
        })

    },
    disableScroll(obj){
        //  禁止页面滚动
        this.setData({
            scrollY:obj.detail.hideModal
        })
    },
    //赔偿详情图片
    previewCompensateImage: function (e) {
        var current = e.target.dataset.src;
        if(this.data.showUserCompensate)
        {
            //商户的
            if(this.data.orderCompensateInfo.image.length)
            {
                let images= this.data.orderCompensateInfo.image.map(item=>{return item.url});
                wx.previewImage({
                    current: current,
                    urls: images
                })
            }
        }
        else
        {
        //    用户的
            if(this.data.proof.image.length)
            {
                let images= this.data.proof.image.map(item=>{return item.url});
                wx.previewImage({
                    current: current,
                    urls: images
                })
            }


        }



    },
    toStoreDetail(){
        wx.navigateTo({
            url:`/pages/merchant/store/store?merchantId=${this.data.orderInfo.merchantId}`
        });
    },
    toGoodsDetail(){
        wx.navigateTo({
            url:`/pages/lease/detail/detail?goodsId=${this.data.orderInfo.goodsId}`
        });
    },
    toPay(){
        //  待支付状态 首次可选择一次性支付 掉起弹框
        this.getPayDetail();
        this.selectComponent("#confirmPay").showModal();

    },
    choosePayRent(e){
        //  支持一次性支付 待支付选择支付方式
        let money='';
        //全支付 打折后的总额减去优惠券
        console.log(((this.data.payInfo.disposablePaymentTotalAmount/ 100) - (this.data.orderLeaseInfo.voucherDiscount / 100) - this.data.choosedCouponPrice));
        console.log((this.data.payInfo.totalAmount / 100) - (this.data.orderLeaseInfo.voucherDiscount / 100) - this.data.choosedCouponPrice);
        if(!this.data.isSelectDisposablePayment)
        {
            money=((this.data.payInfo.disposablePaymentTotalAmount/100)-(this.data.orderLeaseInfo.voucherDiscount/100)-this.data.choosedCouponPrice)<=0?'0.00':((this.data.payInfo.disposablePaymentTotalAmount/100)-(this.data.orderLeaseInfo.voucherDiscount/100)-this.data.choosedCouponPrice).toFixed(2);
        }
        else
        {
            //分款付款
            money=((this.data.payInfo.totalAmount/100)-(this.data.orderLeaseInfo.voucherDiscount/100)-this.data.choosedCouponPrice)<=0?'0.00':((this.data.payInfo.totalAmount/100)-(this.data.orderLeaseInfo.voucherDiscount/100)-this.data.choosedCouponPrice).toFixed(2);
        }
        console.log(money);
        this.setData({
            isSelectDisposablePayment:!this.data.isSelectDisposablePayment,
            factualMoney:money
        })

    },
    getPayDetail(){
        //支付详情
        orderApi.detailPay({id:this.data.orderId}).then(resp=>{
            if(resp.code==200)
            {
                console.log(resp);
                console.log(resp);
                let data=resp.data||{};
                this.setData({
                    payInfo:data,
                });
                if(this.data.orderInfo.state=='pending_pay' && this.data.orderInfo.longLease && this.data.orderInfo.nextPayNum==1)
                {
                    //分期还是一次性选择支付
                    this.choosePayRent();
                }
            }
        }).catch(err=>{
            this.$networkErr(err)
        })
    },
    confirmPay(){
        const _this=this;
        let data=
            {
                id:_this.data.orderId,
                "userBonusId": _this.data.couponId,
            };
        //    待支付 续租待支付
        if(_this.data.orderInfo.state=='pending_relet_pay'||_this.data.orderInfo.state=='pending_pay')
        {
            if(_this.data.payInfo.disposablePaymentEnabled)
            {
                data.isSelectDisposablePayment= _this.data.isSelectDisposablePayment;
            }
            //订单支付 首期租金支付或者含押金支付
            orderApi.orderPay(data)
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
                    this.$networkErr(err)
                })
        }
        else if(_this.data.orderInfo.state=='running')
        {
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
        }else if(_this.data.orderInfo.state=='pending_user_compensate')
        {
        //赔偿
            orderApi.compensatePay(data)
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
        else if(_this.data.orderInfo.state=='return_overdue')
        {
        //    逾期
            orderApi.returnoverDuePay(data)
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
    },
    showWhichCompensate(){
        this.setData({
            showUserCompensate:!this.data.showUserCompensate,
        })
        if(!this.data.showUserCompensate)
        {
        //    获取拒绝信息
            orderApi.refuseCompensateDetail({id:this.data.orderId})
                .then(resp=>{
                    if(resp.code==200)
                    {
                        console.log(resp);
                        let data=resp.data||{};
                        let proof={
                            remark:data.remark,
                            proofInfo:data.proofInfo,
                            image:data.proofImage||[]
                        };
                        proof.image.forEach(item=>{
                            if(item.url.indexOf('http')!=0)
                            {
                                item.url=env.image_host+item.url;
                            }
                        })

                        this.setData({
                            proof:proof
                        })
                    }
                })
                .catch(err=>{
                    this.$networkErr(err)
                })

        }
    }

});