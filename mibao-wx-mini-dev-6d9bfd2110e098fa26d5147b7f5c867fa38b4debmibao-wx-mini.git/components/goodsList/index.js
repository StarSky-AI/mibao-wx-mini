// component/goodsList/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      list:{
        type:Array,
          value(){
          return []
          }
      },
      col:{
        type:Number,
          value:1,
      },
      showOldPrice:{
          type:Boolean,
          value:false,
      },
      darkBg:{
          type:Boolean,
          value:false,
      },
      fromMerchant:{
          type:Boolean,
          value:false,
      }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
      toStore(e){
          wx.navigateTo({
              url:"/pages/merchant/store/store?merchantId="+e.currentTarget.dataset.id
          })
      },
      goodsClick(e){
          wx.navigateTo({
              url:"/pages/lease/detail/detail?goodsId="+e.currentTarget.dataset.id
          })
      }
  }
})
