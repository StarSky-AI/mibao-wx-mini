// pages/order/orderCompensate/compensateApply/compensateApply.js
import orderApi from "../../../../api/order";

Page({

  /**
   * 页面的初始数据
   */
  data: {
      array: [
          {
              name: '赔偿价格超出实际损坏价格'
          },
          {
              name: '并非人为损坏（有相应证明）'
          },
          {
              name: '已与商家协商其他处理方案'
          },
          {
              name: '其他'
          }
      ],
      index:'',
      reason:'',
      applyImgUrl:[],
      content:'',
      hideModal:true,
      goodsInfo:{},//商品信息
      MerchantInfo:{},//商家信息
      orderId:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      // this.selectComponent("#submitSuccess").initAnimation();
      this.setData({
          orderId:options.id,
          goodsInfo:JSON.parse(options.goodsInfo||'{}'),
          MerchantInfo:JSON.parse(options.MerchantInfo||'{}')
      })
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
    bindPickerChange(e){
        //选择原因
        this.setData({
            index: e.detail.value,
            reason:this.data.array[e.detail.value].name
        })
    },
    getData(obj){
        //获取评论图片和内容
        this.setData({
            applyImgUrl:obj.detail.imageUrl,
            content:obj.detail.content,
        })
    },
    submit(){
      let data={
          id:this.data.orderId,
          remark:this.data.reason,
          refuseReasons:this.data.content,
          image:JSON.stringify(this.data.applyImgUrl||[])
      };
      if(!data.remark)
      {
          this.$toast('请选择拒绝赔偿理由')
          return
      }
        if(!data.refuseReasons)
        {
            this.$toast('请填写详细描述');
            return
        }
        if(!data.image)
        {
            this.$toast('请上传拒绝赔偿的图片');
            return
        }
        orderApi.refuseCompensate(data).then(resp=>{
          if(resp.code==200)
          {
              this.$toast('订单赔偿申诉提交成功');
              this.selectComponent("#submitSuccess").showModal();
          }
          else
          {
              this.$toast(resp.message);
          }
        })
          .catch(err=>{
              this.$networkErr(err)
          });

    },
    backToOrder(){
        this.selectComponent("#submitSuccess").hideModal();
        wx.navigateTo({
            url:`/pages/order/orderDetail/orderDetail?id=${this.data.orderId}`
        })
    },
    callphone(){
      const _this=this;
        wx.makePhoneCall({
            phoneNumber: _this.data.MerchantInfo.contactNumber ,
        })
    },
})