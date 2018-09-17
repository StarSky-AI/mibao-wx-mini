import utils from '../../../utils/index';
import creditApi from '../../../api/credit';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name:'',
    certNo:'',
    nameOK:false,
    certNoOK:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
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
  /**
   * 输入姓名
   */
  inputName(e)
  {
    let name = e.detail.value;
  
    this.setData({
      name:name,
      nameOK:utils.validName(name)
    });
    
  },
  /**
   * 输入身份证
   */
  inputCertNo(e)
  {
    let certNo = e.detail.value;
    this.setData({
      certNo:certNo,
      certNoOK:utils.validCertNo(certNo)
    });
  },
  /**
   * 提交
   */
  confirm()
  {
    if(!this.data.nameOK || !this.data.certNoOK)
    {
      return;
    }
  
    creditApi.postRealName({
      name:this.data.name,
      certNo:this.data.certNo
    }).then(resp=>{
      console.log(resp);
      
      if(resp.code===200)
      {
        wx.redirectTo({
          url: '/pages/credit/index/index'
        });
      }
      else
      {
        this.$toast(resp.message);
      }
      
    }).catch(err=>{
      this.$networkErr(err);
    });
    
    
  }
})