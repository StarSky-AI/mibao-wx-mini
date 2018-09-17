// components/pop-up/index.js
Component({
    /**
     * 组件的属性列表
     */
    options: {
        multipleSlots: true // 在组件定义时的选项中启用多slot支持
    },
    data:{
        init:false
    },
    properties: {
        hideModal:{//显示与隐藏
            type:Boolean,
            value:true
        },
        loadingHide:{//等待加载
            type:Boolean,
            value:true
        },
        //弹出位置
        position:{
            type:String,
            value:'bottom'
        },
        closeHide:{
            type:Boolean,
            value:false
        }
    },
    /**
     * 组件的初始数据
     */
    data: {
        animationData:{},
    },
    /**
     * 组件的方法列表
     */
    methods: {
        initAnimation(){
            var animation = wx.createAnimation({
                duration: 200,
                timingFunction: "linear",
            });
            this.animation = animation;
            animation.translateY('100%').step();
            this.setData({
                animationData: animation.export()
            });
        },
        hideModal(){
            if(this.data.position=='top')
            {
                this.setData({
                    hideModal:true
                });
                this.triggerEvent('trigger',{hideModal:this.data.hideModal});
            }
            else
            {
                let animation = this.animation;
                animation.translateY('100%').step();
                this.setData({
                    animationData: animation.export(),
                });
                setTimeout(function () {
                    this.setData({
                        hideModal: true
                    });
                    this.triggerEvent('trigger',{hideModal:this.data.hideModal});

                }.bind(this), 200)
            }

        },
        showModal(){
            if(!this.data.init){ // 未初始化动画
                this.initAnimation(); // 初始化动画
                this.setData({
                    init:true
                })
            }
            let animation = this.animation;
            animation.translateY(0).step();
            this.setData({
                hideModal: false
            });
            setTimeout(()=>{
                this.triggerEvent('trigger',{hideModal:this.data.hideModal});
                this.setData({
                    animationData: animation.export()
                });
            },20);
            
        }
    }
})
