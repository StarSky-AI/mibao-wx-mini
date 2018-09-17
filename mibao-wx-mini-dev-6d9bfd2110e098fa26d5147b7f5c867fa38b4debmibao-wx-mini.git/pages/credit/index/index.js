import personalApi from '../../../api/personal.js';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    url:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      url:options.url,
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
    console.log('do jump');
    this.jumpStep();
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
  
  /**
   * 跳转检测
   * */
  jumpStep()
  {
    
    wx.showLoading({
      title:'正在处理',
      mask:true,
    });
  
    personalApi.getInformation().then(resp=>
    {
      console.log(resp);
    
      if(resp.code===200)
      {
        let data = resp.data || {};
        if(!data.phone)
        {
          wx.navigateTo({
            url: '/pages/credit/phone/phone'
          });
          return;
        }
        //认证状态（0：未认证；1：认证成功；2：上传身份证照片; 3：待完善公司信息；）
        let creditStatus = data.creditStatus;
        if(creditStatus===0)
        {
          wx.navigateTo({
            url: '/pages/credit/realname/realname'
          });
          return;
        }
        else
        {
          wx.setStorageSync('userinfo',data);
          
          wx.navigateTo({
            url: '/pages/credit/score/score'
          });
          return;
        }
        
      }
      else
      {
        this.$login().then(()=>{
          this.jumpStep();
        });
      }
      
      wx.hideLoading();
  
    }).catch(err=>{
      this.$networkErr(err);
    });
    
  },
})