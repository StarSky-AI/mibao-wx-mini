// pages/order/orderReturn/orderReturn.js
import orderApi from '../../../api/order.js';
import commentApi from "../../../api/comment";
var QRCode = require('../../../utils/weapp-qrcode.js')

var qrcode;
let timer=null;//定时器

Page({

  /**
   * 页面的初始数据
   */
  data: {
      logisticsNum:'',//物流单号
      logisticsId:'',//物流公司id
      hideModal:true,
      loadingHide:true,
      array: [
          {
              id: 33,
              name: '美国'
          },
          {
              id: 44,
              name: '中国'
          },
          {
              id: 333,
              name: '巴西'
          },
          {
              id: 234,
              name: '日本'
          }
      ],
      index:'',
        time:30,
      orderId:'',
      returnInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

      console.log(options);
      this.setData({
          orderId:options.id,
          returnInfo:options
      });
    this.getlogisticslist();
      qrcode = new QRCode('canvas', {
          // usingIn: this,
          text: "",
          width: 200,
          height:200,
          colorDark: "#000000",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H,
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
    callphone(){
      const _this=this;
        wx.makePhoneCall({
            phoneNumber: _this.data.returnInfo.contactNumber //仅为示例，并非真实的电话号码
        })
    },
    copy(){
      const _this=this;
        wx.setClipboardData({
            data: _this.data.merchant.merchantAddress,
            success: function(res) {
                wx.hideToast();
                setTimeout(()=>{
                    _this.$toast("复制成功")
                },20)
            }
        })
    },
    notice(){
    this.$toast("此退换码仅适用于线下当面退还物件")
    },
    input(e){
      this.setData({
          logisticsNum:e.detail.value
      })
    },
    confirmReturn(){

        if(!this.data.logisticsId)
        {
            this.$toast("请选择物流公司")
            return
        }

        if(!this.data.logisticsNum)
        {
            this.$toast("请输入物流单号")
            return
        }
        const _this=this;
        wx.showModal({
            title: '提示',
            content: '确认寄回商品吗？',
            success: function(res) {
                if (res.confirm) {
//    收藏
                    let params={
                       id:_this.data.orderId,
                        logisticsCompany:_this.data.logisticsId,
                        logisticsNo:_this.data.logisticsNum,
                    };
                    if(!params.logisticsCompany||!params.logisticsNo)
                    {
                        _this.$toast('请选择物流公司')
                        return
                    }
                    if(!params.logisticsNo)
                    {
                        _this.$toast('请填写物流单号')
                        return
                    }
                    orderApi.return(params)
                        .then(resp=>{
                            if(resp.code==200)
                            {
                                _this.selectComponent("#returnSuccess").showModal();
                            }
                            else if(resp.code==401)
                            {
                                _this.$login().then(()=>{
                                    _this.confirmReturn();
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

                }
            }
        })

    },
    showCode(){
        // 掉起退还码
        const _this=this;
          _this.setData({
              loadingHide:false
          });
        clearInterval(timer);
        let params={
            id:_this.data.orderId,
            };
        orderApi.getReturnCode(params).then(resp=>{
            if(resp.code==200)
            {
                console.log(resp);
                let url=resp.data.refundQrcodeUrl;

                qrcode.makeCode(url);

                setTimeout(()=>{
                    let time=30;
                    _this.setData({
                        time:time
                    });

                    timer=setInterval(()=>{
                        if(time==0)
                        {
                            clearInterval(timer);
                        }
                        else
                        {
                            time--;
                        }
                        _this.setData({
                            time:time
                        });

                    },1000);
                    _this.setData({
                        hideModal:false,
                        loadingHide:true
                    })
                },200)
            }
        }).catch(err=>{
            this.$networkErr(err);
        })

    },
    refreshCode(){
    //  获取code
        this.setData({
            hideModal:true,
            loadingHide:false
        });
        this.showCode();
    },
    hideModal(){
        this.setData({
            hideModal:true
        })
    },
    bindPickerChange(e){
        this.setData({
            index: e.detail.value,
            logisticsId:this.data.array[e.detail.value].id
        })
    },
    getlogisticslist(){
        orderApi.getLogisticsCompany()
            .then(resp=>{
                if(resp.code==200)
                {
                    let data=resp.data||[];
                    this.setData({
                        array:data
                    })
                }
                else
                {
                    this.$toast(resp.message)
                }
            }).catch(err=>{
            this.$toast("网络异常")
        })

    },
    scancode(){
        wx.scanCode({
            onlyFromCamera: true,
            success: (res) => {
                // console.log(res)
                this.setData({
                    logisticsNum:res.result
                })
            }
        })
    },
    backToOrderDetail(){
        wx.navigateTo({
            url:`/pages/order/orderDetail/orderDetail?id=${this.data.orderId}`
        });
    }
})