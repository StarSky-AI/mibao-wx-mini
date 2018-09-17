import creditApi from '../../../api/credit.js';
import leaseApi from '../../../api/lease.js';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showLoading:true,
    extraData:{},
    redirectUrl:'' 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let url = options.url || '';
    let goodsId = options.goodsId || '';
    this.setData({
      redirectUrl:url,
      goodsId:goodsId
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
  onShow: function ()
  {
    wx.showLoading({
      title:'正在处理',
      mask:true,
    });
    setTimeout(()=>{
      let extraData = wx.getStorageSync('face_extra_data') || null;
      if(extraData)
      {
        this.queryFaceResult(extraData);
      }
      else
      {
        this.check();
      }
    },500)
  },
  check()
  {
    creditApi.queryTodayFace({}).then(resp=>{
      if(resp.code===200)
      {
        let data = resp.data || {};
        if(!data.realNameStatus) //未实名
        {
          wx.hideLoading();
          wx.redirectTo({
            url:'/pages/credit/index/index',
          });
        }
        else if(!data.today_liveness_status) //需要扫脸
        {
          
          this.getExtraData();
        }
        else //不用扫脸
        {
          //TODO
          this.lease();
        }
      }
      else if(resp.code===401)
      {
        this.$login().then(()=>{
          this.check();
        });
      }
      else
      {
        wx.hideLoading();
        this.$toast(resp.message);
      }
  
      
    }).catch(err=>{
      wx.hideLoading();
      this.$networkErr(err);
    })
  },
  
  /**
   * 获取扫脸参数
   */
  getExtraData()
  {
    creditApi.queryFaceExtraData({}).then(resp=>{
      if(resp.code===200)
      {
        this.setData({
          extraData:resp.data||{}
        });
        wx.hideLoading();
      }
      else
      {
        this.$toast(resp.message);
      }
    })
  },
  /**
   * 检查扫脸结果
   */
  queryFaceResult(extraData)
  {
    creditApi.queryFaceResult({
      orderNo:extraData.orderNo,
      goodsId:'',
      deliveryWay:'',
      isSelectDepositPayment:'',
    }).then(resp=>{
      
      if(resp.code===200)
      {
        //TODO
        wx.removeStorageSync('face_extra_data');
        wx.hideLoading();
        this.lease();
      }
      else if(resp.code===401)
      {
        this.$login().then(()=>{
          this.queryFaceResult(extraData);
        });
      }
      else
      {
        this.$toast(resp.message);
        wx.removeStorageSync('face_extra_data');
      }
    }).catch(err=>{
      this.$networkErr(err);
    });
  },
  lease(){
    wx.showLoading({ // 先将请求放这里
      title: '请稍候...'
    })
    let data = wx.getStorageSync('orderMsg') || '';
    if(data.goodsId){
      leaseApi.getLeaseReser(data).then(resp=>{
          if(resp.code==200){
            wx.removeStorageSync('orderInfo');  
            wx.removeStorageSync('orderMsg');
            wx.reLaunch({
              url:`${this.data.redirectUrl}?orderId=${resp.data}&result=true`
            });
          }else{
            wx.reLaunch({
              url:`${this.data.redirectUrl}?errorMag=${resp.message}&result=false`
            });
          }
      }).catch(err=>{this.$networkErr();}
      );
    }
  }
});