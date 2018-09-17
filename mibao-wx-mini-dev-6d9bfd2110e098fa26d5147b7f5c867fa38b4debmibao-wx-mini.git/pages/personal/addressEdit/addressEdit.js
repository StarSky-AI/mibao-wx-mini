// pages/personal/addressEdit/addressEdit.js
import utils from '../../../utils/index';
import personalApi from '../../../api/personal.js';
import cityData from '../../../utils/personal/area.js';

Page({
  /**
   * 页面的初始数据
   */
  data: {
    isEdit:false, //默认新增
    address: {},
    region: cityData,
    btnDisabled: false, 		//防止表单重复提交
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options)
  {
    let id = options.id;
    let address = wx.getStorageSync('editAddress') || null;
    
    if(id && address)
    {
      wx.setNavigationBarTitle({
        title:'编辑收货地址'
      });
      
      this.setData({
        address:address,
        isEdit:true,
      });
    }
    else
    {
      wx.setNavigationBarTitle({
        title:'新增收货地址'
      });
  
      this.setData({
        address:{},
        isEdit:false,
      });
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
  //监听收件人
  inputName(e)
  {
    this.setData({
      'address.name': e.detail.value
    })
    
  },
  //监听电话
  inputPhone(e)
  {
    this.setData({
      'address.phone': e.detail.value
    })
    
  },
  //监听详细地址
  inputAddr(e)
  {
    this.setData({
      'address.text': e.detail.value
    })
  },
  //监听省市区
  bindRegionChange: function (e) {
    this.setData({
      'address.provice': e.detail.value[0],
      'address.city': e.detail.value[1],
      'address.regoin': e.detail.value[2]
    });
  },
  //设置默认地址开关
  switchChangeEvent: function () {
    let defaulted = !this.data.address.defaulted;
    this.setData({
      'address.defaulted': defaulted
    });
  },
  /**
   * 提交
   */
  addrFormSubmit: function ()
  {
    if(this.btnDisabled)
    {
      return;
    }
    
    let address = this.data.address || {};
    
    if (!address.name)
    {
      this.$toast('请填写正确的收件人姓名');
      return;
    }
    if (!utils.validPhoneAndTel(address.phone))
    {
      this.$toast('请填写正确联系电话');
      return;
    }
    if (!address.provice || !address.city || !address.regoin)
    {
      this.$toast('请选择正确的省市区');
      return;
    }
    if (!address.text)
    {
      this.$toast('请填写详细地址');
      return;
    }
    
    this.setData({
      btnDisabled: true
    });
    
    let data = {
      name: this.data.address.name,
      phone: this.data.address.phone,
      provice: this.data.address.provice,
      city: this.data.address.city,
      regoin: this.data.address.regoin,
      text: this.data.address.text,
      defaulted: this.data.address.defaulted || false,
    };
    
    if(this.data.isEdit)
    {
      data.id = this.data.address.id;
      personalApi.editAddress(data).then(resp=>{
        this.postSave(resp);
      }).catch(err=>{
        this.$networkErr(err);
        wx.hideLoading();
        this.setData({
          btnDisabled: false
        });
      });
    }
    else
    {
      personalApi.addAddress(data).then(resp=>{
        this.postSave(resp);
      }).catch(err=>{
        this.$networkErr(err);
        this.setData({
          btnDisabled: false
        });
      });
    }
    
  },
  /**
   * 处理地址保存后跳转
   */
  postSave (resp)
  {
    if (resp.code === 200)
    {
      this.$toast('保存成功');
      setTimeout(()=>{
        wx.navigateBack({
          delta: 1
        });
      },1000);
      
    }
    else if(resp.code===401)
    {
      this.$login().then(()=>{
        this.addrFormSubmit();
      });
    }
    else
    {
      this.$toast(resp.message);
      this.setData({
        btnDisabled: false
      });
    }
  }
});