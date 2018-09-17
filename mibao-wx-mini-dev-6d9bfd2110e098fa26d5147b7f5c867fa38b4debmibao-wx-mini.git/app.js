import '/addon/Page';
import '/addon/Component';

import personalApi from '/api/personal';
import {upLoadImg} from './utils/upload.js';
App({
  upLoadImg,
  data:{
    userInfo:{},
    loginInfo:{},
  },
  onLaunch: function (options)
  {
    // console.log('app onLaunch',options);
  },
  onShow:function (options)
  {
    //第三方扫脸程序会传递结果到options.referrerInfo.extraData中，需要存储
    // console.log('app onShow', options);
    if(options && options.referrerInfo && options.referrerInfo.extraData)
    {
      wx.setStorageSync('face_extra_data',options.referrerInfo.extraData);
    }

  },
  login() //授权登录
  {
    console.log('app login start...');
    return new Promise((resolve,reject)=>{
      //先检查是否已授权用户信息
      wx.getUserInfo({
        withCredentials:true,
        success: info =>
        {
          console.log(info);
          this.data.userInfo = info.userInfo;
      
          //获取临时code并登录
          wx.login({
            success: res=>
            {
              console.log(res);
              if (res.code)
              {
                personalApi.login({
                  jsCode:res.code,
                  iv:info.iv,
                  encryptedData:info.encryptedData,
                }).then(resp=>
                {
                  if(resp.code===200)
                  {
                    let _data = resp.data || {};
                    this.data.loginInfo = _data;
                    wx.setStorageSync('token',_data.token);
                    
                    //可能没有绑定手机，需要先绑定
                    if(!_data.bindStatus)
                    {
                      this.bindPhone();
                    }
                    else
                    {
                      resolve(this.data);
                    }
                  }
                  else
                  {
                    this.loginFail(resp.message);
                  }
                }).catch(err=>{
                  this.loginFail('网络异常,请稍后再试');
                });
              }
              else
              {
                this.loginFail(res.message);
              }
            }
          });
      
        },
        fail:err=>
        {
          //用户未授权,去授权
          this.authorize();
        }
      });
      
    });
    
  },
  /**
   * 获取用户授权信息
   */
  authorize()
  {
    console.log('去授权。。。');
    wx.navigateTo({
      url:'/pages/openData/userInfo/index',
    });
  },
  /**
   * 绑定手机号
   */
  bindPhone()
  {
    console.log('去绑定手机。。。');
    wx.navigateTo({
      url:'/pages/openData/phoneRegister/index',
    });
  },
  /**
   * 处理授权登录某个环节失败
   * @param fail
   */
  loginFail(fail)
  {
    wx.showToast({
      title: fail,
      icon: 'none',
      duration: 1500
    })
  }
});