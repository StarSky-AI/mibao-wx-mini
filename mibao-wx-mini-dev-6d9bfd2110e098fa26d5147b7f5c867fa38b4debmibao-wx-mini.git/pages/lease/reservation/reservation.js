import leaseApi from '../../../api/lease.js';
import WxParse from "../../../templates/wxParse/wxParse.js"; // 将文本解析为HTML
Page({
  data: {
    addressID:'', // 用户选完地址之后的ID
    bindData:'',
    submitDis:false,
    submitText:'确认下单',
    tabIndex:0, 
    storeFirst:{}, // 门店自提的第一个 必渲染的数据
    storeList:[], // 门店自提列表
    creditStatus:0,  // 京东 1 支付宝 2 其他值 必付押金
    agreeText:'',  // 协议text
    params:{}, // 上个页面拿过来的参数 
    couponList:[], // 优惠券列表
    storeList:[], // 门店自提的弹框选择
    addressList:[],
    expressAddress:{},  // 快递地址
    storeAddress:{}, // 门店地址
    totalPrice:0,
    savePrice:0, // 节省了多少钱
    text:'小白信用免押金',
    selectId:0,
    goodsWhiteListStatus:false, // 白名单商品
    merchantWhiteListStatus:false // 白名单用户
  },
  // 押金模式 白名单商品 商家白名单用户 都不需要扫脸下单
  onLoad: function(options){
    let creditStatus = wx.getStorageSync('creditStatus');
    let params = wx.getStorageSync('orderInfo'); // 获取用户选择的订单信息
    let text = '';
    if(creditStatus==1){ // 可免  京东免押金
      params.checked=false;
      text = '小白信用免押金';
    }else if(creditStatus==2){ // 可免  支付宝免押金
      params.checked=false;
      text = '芝麻信用免押金';
    }else{ // 其他情况一律强制交押金
      params.checked=true;
      text = '';
    }
    this.setData({ // 获取是京东或者支付宝免押金
      creditStatus:creditStatus,
      text:text,
      params:params
    })
    this.changeTab(); 
    this.getCoupon();
  },
  onShow(){
    this.init();
  },
  init(){
    let id = wx.getStorageSync('userSelectAdd') || '';// 用户如果选择了某个地址 会把地址的ID传回来
    let index = this.data.tabIndex;
    if(id){
      wx.removeStorageSync('userSelectAdd');
      this.setData({
        selectId:id
      })
    }
    let params = wx.getStorageSync('orderInfo'); // 获取用户选择的订单信息
    if(params.deliveryWay[index]=='TO_DOOR_SERVICE'){ // 默认第一个为快递配送 这样要去请求用户地址
      this.getUserContacts(id)
    }else{
      this.showList();
    }
  },
  getUserContacts(id){
    if(id){
      leaseApi.getUserContacts({id}).then(resp=>{
        if(resp.code==200){
          this.setData({
            expressAddress:resp.data
          })
        }else if(resp.code==401){ // 需要登录才能拿到地址
          this.$login().then(()=>{
            this.getUserContacts(id);
          })
        }
      }).catch(err=>{
        this.$networkErr();
      });
    }else{  // 如果没有ID  去请求用户的地址列表  把默认的放上去
      this.getAddress();
    }
  },
  iptMsg(e){ 
    this.setData({
      'params.msg':e.detail.value
    }) 
  },
  submit(){// 确认下单
    let params = this.data.params;
    let index = this.data.tabIndex;
    let sku = params.sku;
    let currentAddress = '';
    if(params.deliveryWay[index]=='TO_DOOR_SERVICE'){ // 当前用户选择的是快递
      currentAddress = this.data.expressAddress;
    }else{
      currentAddress = this.data.storeAddress;
    }
    if(currentAddress.id==undefined||!currentAddress.name||!currentAddress.phone||!currentAddress.text){
      this.$toast('请选择正确的地址')
      return;
    }
    this.setData({
      submitDis:true,
      submitText:'下单中',
    })
    let data = {
      "goodsId": params.goodsId, // 商品ID
      "channel": "wechat",  //下单渠道
      // "contactId": 1,   // 收货人地址  快递方式必填   门店自提不填
      "orderType": "COMMON", // 订单类型：COMMON-普通，PUSHING-地推
      "deliveryWay": params.deliveryWay[index], // 提货方式
      "userBonusId": params.coupon.id, //优惠券ID
      "longitude": "", // 经度
      "latitude": "", // 维度
      "isSelectInsurance": params.insurance.choose, // 是否选择保险
      "leaseNum": 1, // 下单数量
      "isSelectDepositPayment": params.checked, // 是否选择押金模式
      "remark": params.msg, // 用户备注
    }; // 整理参数准备下单
    if(params.activityId){ // 有活动要传活动ID
      data.activityId = params.activityId;
    }
    if(params.deliveryWay[index] == 'PRIVATE_STORE'){  // 门店自提下 要传门店ID 
      data.pickUpMerchantStoreId = currentAddress.id;
    }else{
      data.contactId = currentAddress.id;
    }
    sku.forEach( item => {
      data[item.specification] = item.chooseSku
    })
    let that = this;
    wx.getLocation({
      type: 'wgs84',
      success: function(res) {
        data.latitude = res.latitude;
        data.longitude = res.longitude;
        that.temp(data,params)
      },
      fail: function(){
        that.temp(data,params)
      },
    })
  },
  temp(data,params){
    wx.setStorageSync('orderMsg',data);
    this.setData({
      submitDis:false,
      submitText:'确认下单',
    })
    if(params.checked){ // 押金模式 不需要扫脸
      this.lease();
    }else{ // 非押金模式  查询是否白名单商品或者白名单用户
      leaseApi.queryWhiteListed({ // 先查询是否白名单商品或者是商户的白名单用户 如果是 则直接下单
        goodsId:this.data.params.goodsId
      }).then(resp=>{
        if(resp.code == 200){
          let data = resp.data;
          let goodsWhiteListStatus = !!data.goodsWhiteListStatus;
          let merchantWhiteListStatus = !!data.merchantWhiteListStatus;
          if(goodsWhiteListStatus || merchantWhiteListStatus){ // 如果是白名单商品或者用户是商家白名单用户则不需要扫脸验证
            this.lease();
          }else{  // 如果都不是 再去判断刷脸结果 看当前是刷脸回来还是第一次进来  需要刷脸
            wx.navigateTo({   
              url: '/pages/credit/face/face?url=/pages/lease/reservationResult/reservationResult'
            })
          }
        }else{
          this.$toast(resp.message)
        }
      }).catch(err=>{
        this.$networkErr();
      });
    }

  },
  lease(){
    wx.showLoading({ // 先将请求放这里
      title: '请稍候...'
    })
    let data = wx.getStorageSync('orderMsg') || '';
    if(data.goodsId){
      leaseApi.getLeaseReser(data).then(resp=>{ // 这里由于之前已经判断过 是押金或者白名单 所以直接跳详情页
          if(resp.code==200){
            wx.removeStorageSync('orderInfo');  
            wx.removeStorageSync('orderMsg');
            wx.redirectTo({
              url:`/pages/order/orderDetail/orderDetail?id=${resp.data}`
            });
          }
      }).catch(err=>{this.$networkErr();}
      );
    }
  },
  radioChange(e){
    let val = e.detail.value || {};
    let item = null;
    if(val=='main'){
      item = this.data.storeFirst;
    }else{
      item = this.data.storeList[Number(val)]
    }
    this.setData({
      storeAddress:item
    })
    this.selectComponent("#store").hideModal();
  },
  selectAdd(){
    let index = this.data.tabIndex;
    let params = this.data.params;
    let deliveryWay = params.deliveryWay;
    if(deliveryWay[index]=='PRIVATE_STORE'){ // 弹自提门店列表
        this.showList();
    }else{ // 选快递地址
      wx.navigateTo({
        url: '/pages/personal/addressList/addressList?url=/pages/lease/reservation/reservation'
      })
    }
  },
  showList(){
    let index = this.data.tabIndex;
    let params = this.data.params;
    let deliveryWay = params.deliveryWay;
    if(deliveryWay[index]=='PRIVATE_STORE'){ // 弹自提门店列表
      if(!this.data.storeList.length || this.data.storeFirst.id==undefined){
        leaseApi.getMerchantStore({
          merchantId:params.merchantId,
          "pageNum": 1,
          "pageSize": 20
        }).then(
          resp=>{
            if(resp.code==200){
              let data = resp.data;
              let first = data.merchantStoreBean || {}; // 必有的 
              let list = data.merchantStoreBeanList.list || [];
              this.setData({
                storeFirst:first,
                storeAddress:first,
                storeList:list
              })
            }else{
              this.$toast(resp.message)
            }
          }
        ).catch(
          error=>{
            this.$networkErr();
          }
        );
      }else{
        this.selectComponent("#store").showModal();
      }
    }else{
      wx.navigateTo({
        url: '/pages/personal/addressList/addressList?url=/pages/lease/reservation/reservation'
      })
    }
  },
  getAddress(){ // 获取用户收货地址
    leaseApi.getAddress().then(resp=>{
      if(resp.code == 200){
        let that = this;
        let addressList = resp.data || [];
        if(addressList.length){ // 如果列表里有数据
          if(!this.data.selectId){ // 如果用户没有选过某地址
            if(addressList.length==1){  // 如果只有一个地址 直接选中
              that.setData({
                expressAddress:addressList[0],
                selectId:addressList[0].id
              })
            }else{
              addressList.forEach(item=>{ // 拿默认
                if(item.defaulted){
                  that.setData({
                    expressAddress:item,
                    selectId:item.id
                  })
                }
              })
            }
          }else{ // 如果用户选过某地址  则要检查此地址是否存在
            let promise = new Promise((resolve,reject)=>{
              let flag = false;
              for(let i =0;i<addressList.length;i++){
                if(addressList[i].id==this.data.selectId){ // 找到了当前地址
                  that.setData({
                    expressAddress:addressList[i],
                    selectId:addressList[i].id
                  })
                  flag = true;
                  break;
                }
              }
              !flag?reject():''; // 如果找不到  则要走接下来的流程
            })
            promise.catch(()=>{
              let fl = false;
              if(addressList.length==1){   // 如果地址只有一个 直接拿
                that.setData({
                  expressAddress:addressList[0],
                  selectId:addressList[0].id
                })
                fl = true;
              }else{
                addressList.forEach(item=>{ // 拿默认
                  if(item.defaulted){
                    fl=true;
                    that.setData({
                      expressAddress:item,
                      selectId:item.id
                    })
                  }
                })
              }
              if(!fl){ 
                  that.setData({
                    expressAddress:{},
                    selectId:0
                  })
              }
            })
          }
        }else{  // 否则 说明用户刚才把所有地址删掉了 就清除当前渲染的地址数据
          this.setData({
            expressAddress:{},
            selectId:0
          })
        }
      }else if(resp.code == 401){
        this.$login().then(()=>{
          this.getAddress();
        });
      }else{
        this.$toast(resp.message)
      }
    }).catch(err=>{
      this.$networkErr();
    });
  },
  seeAgreement(){
    let text = this.data.agreeText;
    if(text){
      this.selectComponent("#agreement").showModal();
      return;
    }else{
      leaseApi.getAgreement().then(resp=>{
        if(resp.code == 200){
          this.setData({
            agreeText:resp.data
          })
          let pictDetailALL = resp.data;
          WxParse.wxParse('pictDetailALL','html', pictDetailALL, this, 5);
          this.selectComponent("#agreement").showModal();
        }else{
          this.$toast(resp.message)
          this.setData({
            agreeText:''
          })
        }
      }).catch(err=>{
        this.$networkErr();
        this.setData({
          agreeText:''
        })
      });
    }
  },
  seeStages(){
    let params = this.data.params;
    wx.setStorageSync('orderInfo',params);
    wx.navigateTo({
      url: '/pages/lease/stagesPrice/stagesPrice'
    })
  },
  computedPrice(){ // 计算总价
    let params = this.data.params;
    let price = 0;
    let basePrice = params.rent;
    let days = params.days;
    let couponPrice = params.coupon.price;
    let savePrice = 0; // 使用优惠券后节省的钱
    price = basePrice * days;
    if(params.insurance.choose){ // 选择了保险
      price+=params.insurance.price;
    }
    if(couponPrice){ // 用户选择了优惠券
      let oldPrice = price;  // 用优惠券之前的价格
      price-=couponPrice;   
      price=price>0?price:0; // 用优惠券之后的价格
      savePrice = oldPrice - price;
    }
    if(this.data.params.checked){ // 选择了押金
      price+=params.deposit;
    }
    this.setData({
      totalPrice:price,
      savePrice:savePrice
    })
  },
  useCoupon(e){
    let item = e.currentTarget.dataset.item;
    this.setData({
      'params.coupon.price':item.price,
      'params.coupon.id':item.id
    })
    this.computedPrice();
    this.hideModal();
  },
  noCoupon(){
    this.setData({
      'params.coupon':{
        price:'',   // 优惠券价格
        id:''     // 优惠券ID
      }
    })
    this.computedPrice();
  },
  chooseCoupon(){
    let params = this.data.params;
    if(params.whiteListed){
      this.$toast('抱歉 ! 此商品无法使用优惠券');
      return;
    }
    if(this.data.couponList.length){
      this.showModal();
    }else{
      this.$toast('抱歉 ! 暂无可用优惠券')
    }
  },
  changeTab(e){
    let index = 0;
    if(e){
      index = Number(e.currentTarget.dataset.index);
      if(index==this.data.tabIndex){
        return;
      }
    }
    let deliveryWay = this.data.params.deliveryWay;
    let text = deliveryWay[index]=='TO_DOOR_SERVICE'?'配送地址':'自提门店';
    this.setData({
      tabIndex:index,
    })
    if(deliveryWay[index]=='TO_DOOR_SERVICE'){
      this.getAddress();
    }else{
      if(this.data.storeAddress.id==undefined){ // 如果没有选择 则要有默认选择
        this.showList()
      }
    }
  },
  selectInsurance(){
    let insurance = this.data.params.insurance;
    if(insurance.Mandatory){ // 必选
      return;
    }else{ // 非必选 也就是说可选可不选
      this.setData({
        'params.insurance.choose':!this.data.params.insurance.choose
      })
      this.getCoupon();
    }
    this.computedPrice();
  },
  switchChange(){
    let creditStatus = this.data.creditStatus;
    if(creditStatus==1||creditStatus==2){ // 不强制交
      this.setData({
        'params.checked':!this.data.params.checked
      })
      this.computedPrice();
    }else{
      this.setData({
        'params.checked':true
      })
    }
  },
  getCoupon(){
    let params = this.data.params;
    if(params.whiteListed){ // 如果是白名单商品 renturn 出去 
      return;
    }
    let baseRent = params.rent; // 以分为单位的价格
    let days = params.days;
    let payMoney = 0;  // 固有的金额 即日租金乘以天数
    if(days>30){
      payMoney = baseRent*30;
    }else{
      payMoney = baseRent*days;
    }
    if(params.insurance.control&&params.insurance.choose){ // 如果有保险 并且用户选中
      let price = params.insurance.price;
      payMoney += price;
    }
    leaseApi.getCoupon({
      price:payMoney,
      goodsId:params.goodsId
    }).then(resp=>{
      if(resp.code == 200){
        let couponList = resp.data.managerUserBonusList || [];
        if(couponList.length){
          couponList = couponList.sort((a,b)=>{
            return a.price<b.price
          })
          this.setData({
            couponList:couponList,
            'params.coupon.price':couponList[0].price || '',
            'params.coupon.id':couponList[0].id || '',
          })
        }
        this.computedPrice();
      }else if(resp.code == 401){
        this.$login().then(()=>{
          this.getCoupon();
        });
      }else{
        this.$toast(resp.message)
      }
    }).catch(err=>{
      this.$networkErr();
    });
    },
    showModal(){ // 被万众调用的showModal的方法
      this.selectComponent("#modal").showModal();
    },
    hideModal(){
      this.selectComponent("#modal").hideModal();
    }
})