// components/navbar/navbar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    index:Number
  },

  /**
   * 组件的初始数据
   */
  data: {
    tabs:[
      {
        name:'首页',
        icon:'icon-nav_home',
        index:0,
      },
      {
        name:'分类',
        icon:'icon-nav_classification',
        index:1,
      },
      {
        name:'我的',
        icon:'icon-nav_personal',
        index:2,
      },
    ],
    activeIndex:-1,
  },

  ready()
  {
    this.setData({
      activeIndex:this.data.index
    });
  },
  
  /**
   * 组件的方法列表
   */
  methods: {
    tapTab(e)
    {
      let tab = e.currentTarget.dataset.tab || {};
      this.switchTab(tab);
      /*this.setData({
        activeIndex:tab.index
      });*/
    },
    switchTab(tab)
    {
      switch(tab.index)
      {
        case 0: //首页
        {
          wx.reLaunch({
            url:'/pages/home/index/index'
          });
          
          break;
        }
        case 1:  //分类
        {
          wx.reLaunch({
            url:'/pages/home/category/category'
          });
          
          break;
        }
        case  2: //我的
        {
          wx.reLaunch({
            url:'/pages/personal/index/index'
          });
          
          break;
        }
        default:
        {
          break;
        }
      }
    }
  }
});
