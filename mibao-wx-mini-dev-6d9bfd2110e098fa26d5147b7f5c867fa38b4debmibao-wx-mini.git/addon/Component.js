/**
 * 扩展小程序component对象
 * */

const _component = Component;

Component = function(config)
{
  config.methods.$toast = function (msg)
  {
    wx.showToast({
      title: msg || '',
      icon: 'none',
      duration: 1500
    })
  };
  
  config.methods.$networkErr = function (err)
  {
    console.log(err);
    wx.showToast({
      title: '网络异常,请稍后再试',
      icon: 'none',
      duration: 1500
    })
  };
  
  return _component(config);
};

