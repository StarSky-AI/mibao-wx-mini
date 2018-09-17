// components/pop-up/index.js
Component({
    /**
     * 组件的方法列表
     */
    properties: {
        show: { 
            type: Boolean,
            value: false,
        },
    },
    methods: {
        goHome(){
            wx.reLaunch({
                url:"/pages/home/index/index"
            })
        },
    }
})
