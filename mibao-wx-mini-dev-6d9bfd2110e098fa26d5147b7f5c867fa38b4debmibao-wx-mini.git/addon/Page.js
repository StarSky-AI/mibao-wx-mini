/**
 * 扩展小程序Page对象
 * */

const _page = Page;


Page = function(config)
{
  /**
   * 给onLoad方法做拦截
   */
  const { onLoad } = config;
  config.onLoad = function(onLoadOptions)
  {
    //TODO 打log，做埋点...
  
    /**
     * 在onLoad里获取上一个页面对象
     */
    const pages = getCurrentPages();
    this.$previousPage = pages[pages.length - 2] || {};
  
    
    //执行页面的onLoad方法
    if (typeof onLoad === 'function')
    {
      onLoad.call(this, onLoadOptions);
    }
    
  };
  
  //扩展page方法
  /**
   * $toast
   * @param msg
   */
  config.$toast = function (msg)
  {
    wx.showToast({
      title: msg || '',
      icon: 'none',
      duration: 1500
    })
  };
  
  config.$networkErr = function (err)
  {
    wx.showToast({
      title: '网络异常,请稍后再试',
      icon: 'none',
      duration: 1500
    })
  };
  
  /**
   * 统一登录并处理，返回promise
   */
  config.$login = function ()
  {
    let pages = getCurrentPages() || [];
    let currentPage = pages[pages.length-1] || {};
    if(currentPage.route !== 'pages/openData/userInfo/index')
    {
      wx.setStorageSync('before_login_page',currentPage);
    }
    return getApp().login();
  };
  
  return _page(config);
};

