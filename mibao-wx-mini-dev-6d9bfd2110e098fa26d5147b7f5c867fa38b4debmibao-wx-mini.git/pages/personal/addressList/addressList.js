// pages/personal/addressList/addressList.js
import personalApi from '../../../api/personal.js';

Page({
  data: {
    //蒙版
    maskhidden: false,
    content: false,
    addressList: [],
    startX: 0, //开始坐标
    startY: 0,
    clientX: 0,
    clientY: 0,
    redirectUrl:''
  },
  onLoad: function (options) {
    let url = options.url || '';
    this.setData({
      redirectUrl:url
    })
    let that = this;
    wx.showLoading({
      title: '加载中',
    });
    that.setData({
      maskhidden: false,
    });
    
  },
  onReady: function () {
  
  },
  onShow()
  {
    this.getListData();
  },
  selectAdd(e){ //用户选择了某个地址
    let url = this.data.redirectUrl;
    if(url){
      let id = e.currentTarget.dataset.id || '';
      if(id&&url){
        wx.setStorageSync('userSelectAdd',id)
        wx.navigateBack();
      }
    }
  },//编辑地址
  edit: function (e) {
    let item = e.currentTarget.dataset.item;
    wx.setStorage({
      key: 'editAddress',
      data: item,
      success()
      {
        wx.navigateTo({
          url: '/pages/personal/addressEdit/addressEdit?id=' + item.id
        })
      }
    })
    
  },
  //手指触摸动作开始 记录起点X坐标
  touchstart: function (e) {
    //开始触摸时 重置所有删除
    this.data.addressList.forEach(function (v, i) {
      if (v.isTouchMove)//只操作为true的
        v.isTouchMove = false;
    })
    this.setData({
      startX: e.changedTouches[0].clientX,
      startY: e.changedTouches[0].clientY,
      addressList: this.data.addressList
    })
  },
  //滑动事件处理
  touchmove: function (e) {
    var that = this,
      index = e.currentTarget.dataset.index,//当前索引
      startX = that.data.startX,//开始X坐标
      startY = that.data.startY,//开始Y坐标
      touchMoveX = e.changedTouches[0].clientX,//滑动变化坐标
      touchMoveY = e.changedTouches[0].clientY,//滑动变化坐标
      //获取滑动角度
      angle = that.angle({X: startX, Y: startY}, {X: touchMoveX, Y: touchMoveY});
    that.data.addressList.forEach(function (v, i) {
      v.isTouchMove = false
      //滑动超过30度角 return
      if (Math.abs(angle) > 30) return;
      if (i == index)
      {
        if (touchMoveX > startX) //右滑
          v.isTouchMove = false
        else //左滑
          v.isTouchMove = true
      }
    })
    //更新数据
    that.setData({
      addressList: that.data.addressList
    })
  },
  /**
   * 计算滑动角度
   * @param {Object} start 起点坐标
   * @param {Object} end 终点坐标
   */
  angle: function (start, end) {
    var _X = end.X - start.X,
      _Y = end.Y - start.Y
    //返回角度 /Math.atan()返回数字的反正切值
    return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
  },
  //删除事件
  del: function (e) {
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    let addressList = this.data.addressList;
    let that = this;
    wx.showModal({
      title: '提示',
      content: '您确定删除吗？',
      success: function (e) {
        if (e.confirm)
        {
          personalApi.getAddressRemove({
            id: item.id
          }).then(resp => {
            if (resp.code == 200)
            {
              addressList.splice(index, 1);
              that.setData({
                addressList: addressList
              });
              wx.removeStorage({
                key: 'editAddress'
              })
            }
          })
        }
      }
    })
  },
  newAddress(){
    wx.navigateTo({
      url: '/pages/personal/addressEdit/addressEdit'
    });
    wx.removeStorage({
      key: 'editAddress'
    })
  },
  //获取数据
  getListData: function () {
    
    personalApi.getAddressList().then(resp => {
      if (resp.code === 200)
      {
        console.log(resp);
        
        let addressList = resp.data || [];
        this.setData({
          addressList: addressList
        });
        
      }
      else if(resp.code===401)
      {
        this.$login().then(()=>{
          this.getListData();
        });
      }
      else
      {
        this.$toast(resp.message);
      }
  
      this.setData({
        maskhidden: true
      });
      
      wx.hideLoading();
      
    }).catch(err => {
      this.$networkErr(err);
    });
  }
});
