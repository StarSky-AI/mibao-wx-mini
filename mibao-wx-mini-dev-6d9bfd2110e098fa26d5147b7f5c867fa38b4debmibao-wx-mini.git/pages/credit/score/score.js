// pages/credit/score/score.js
import creditApi from '../../../api/credit';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    xbScore:0, //小白分
    zmScore:0, //芝麻分
    
    xbThreshold:85, //小白分通过值
    zmThreshold:600, //芝麻分通过值
  
    //用户信息
    user:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
  
    let user = wx.getStorageSync('userinfo') || {};
    this.setData({
      user:user,
    });
    
    if(options.accessToken)
    {
      this.xiaobaoAuthCallback(options.accessToken);
    }
    else
    {
      this.getData();
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
  
  getData()
  {
     creditApi.queryCreditScore({}).then(resp=>{
       if(resp.code===200)
       {
         let data = resp.data || {};
         this.setData({
           xbScore:parseFloat(data.xbScore || '0'), //小白分
           zmScore:parseFloat(data.zmxyScore || '0'), //芝麻分
           xbThreshold:parseFloat(data.xbScoreThreshold || '85'), //小白分通过值
           zmThreshold:parseFloat(data.zmxyScoreThreshold || '600'), //芝麻分通过值
         });
         
         //京东已授权，并且京东或者芝麻ok，直接跳下单
         if(this.data.xbScore>0)
         {
           if(this.data.xbScore >= this.data.xbThreshold || this.data.zmScore >= this.data.zmThreshold)
           {
             this.reservation();
           }
         }
         
       }
       else if(resp.code===401)
       {
         this.$login().then(()=>{
           this.getData();
         });
       }
       else
       {
         this.$toast(resp.message);
       }
       
     }).catch(err=>{
       this.$networkErr(err);
     });
     
  },
  /**
   * 小白授权
   */
  xiaobaoAuth()
  {
    console.log('去小白授权');
    wx.navigateTo({
      url:'/pages/credit/jdAuth/jdAuth',
    });
  },
  /**
   * 授权回调
   */
  xiaobaoAuthCallback(accessToken)
  {
    creditApi.xiaobaiCallback({
      accessToken:accessToken,
      channel:'jdxb_wxminiprogram',
    }).then(resp=>{
      console.log(resp);
      if(resp.code===200)
      {
        this.getData();
      }
      else
      {
        this.$toast(resp.message);
      }
    }).catch(err=>{
      this.$networkErr(err);
    })
  },
  /**
   * 去下单
   */
  reservation()
  {
    console.log('去下单');
    let xiaobaiPass = this.data.xbScore >= this.data.xbThreshold;
    let zhimaPass = this.data.zmScore >= this.data.zmThreshold;
    
    //creditState 1,小白免押 2，支付宝免押，其他或者没有参数，必须付押金
    let creditStatus = xiaobaiPass?1:zhimaPass?2:0;
    wx.setStorageSync('creditStatus',creditStatus);
    wx.redirectTo({
      url:'/pages/lease/reservation/reservation?creditStatus=' + creditStatus,
    });
  },
  
  /**
   * 押金下单
   */
  quickLease()
  {
    console.log('押金下单');
    wx.setStorageSync('creditStatus',0);
    wx.redirectTo({
      url:'/pages/lease/reservation/reservation',
    });
  },
});