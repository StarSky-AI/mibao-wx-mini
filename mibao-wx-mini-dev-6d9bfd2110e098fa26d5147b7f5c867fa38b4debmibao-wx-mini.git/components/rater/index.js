// component/rater/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    light:{
      type:Number,
        value:3,
    },
      dark:{
          type:Number,
          value:0,
      },
      finish:{
          type:Boolean,
          value:false,
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      lightNum:0,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    rate(e){
        let index=e.currentTarget.dataset.id;
        this.setData({
            lightNum:index
        });
        // console.log(this.data.lightNum);
        this.triggerEvent('choose',{rate:this.data.lightNum});
    }
  }
})
