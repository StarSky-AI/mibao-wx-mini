import personalApi from "../../../api/personal";
var app = getApp();
Page({
    data:{
        tab:['未使用','已使用','已过期'],
        //蒙版
        UsedCoupon:[], //未使用
        UnusedCoupon:[], //已使用
        InvalidCoupon:[],  //已过期
        winHeight:"",  //窗口高度
        currentTab:0, //预设当前项的值
        scrollLeft:0, //tab标题的滚动条位置
        NohresholdT: null //无门槛
    },
    // 滚动切换标签样式
    swiperChange:function(e){
        this.setData({
            currentTab:e.detail.current
        });
        this.getCoupon();
        // this.checkCor();
    },
    // 点击标题切换当前页时改变样式
    changeTab:function(e){
        let index = e.target.dataset.index;
        let currentTab = this.data.currentTab;
        if(index==currentTab){
            return;
        }else{
            this.setData({
                currentTab:index
            })
            this.getCoupon();
        }
    },
    showGuide(){
        this.selectComponent("#guide").showModal();
    },
    //判断当前滚动超过一屏时，设置tab标题滚动条。
    // checkCor:function(){
    //     if (this.data.currentTab>4){
    //         this.setData({
    //             scrollLeft:300
    //         })
    //     }else{
    //         this.setData({
    //             scrollLeft:0
    //         })
    //     }
    // },
    onLoad: function() {
        let that = this;
        wx.showLoading({
            title: '加载中...',
        });
        //  高度自适应
        wx.getSystemInfo({
            success: function( res ) {
                var clientHeight=res.windowHeight,
                    clientWidth=res.windowWidth,
                    rpxR=750/clientWidth;
                var  calc=clientHeight*rpxR-180;
                console.log(calc)
                that.setData( {
                    winHeight: calc
                });
            }
        });
        this.getCoupon('init') // 页面刚打开的时候 去请求第一页的优惠券
    },
    footerTap:app.footerTap,
    getCoupon(init){
        let currentTab = this.data.currentTab;
        if(init=='init' || currentTab==0){
            this.getUsedCoupon();
        }else if(currentTab==1){
            this.getUnusedCoupon();
        }else{
            this.getInvalidCoupon();
        }
    },
    getUsedCoupon(){ // 获取可用优惠券
        let UsedCoupon = this.data.UsedCoupon; //未使用
        if(UsedCoupon.length){  // 已经请求过的 直接return出去
            return;
        }
        personalApi.getCoupon().then(resp=>{
            if(resp.code == 200) {
                wx.hideLoading();
                this.setData({
                    UsedCoupon: resp.data.list
                })
            } else {
                that.$toast(resp.message);
            }
        }).catch(err=>{
            this.$networkErr();
        })
    },
    getUnusedCoupon(){ // 获取已使用优惠券
        let UnusedCoupon = this.data.UnusedCoupon; //未使用
        if(UnusedCoupon.length){  // 已经请求过的 直接return出去
            return;
        }
        personalApi.getCoupon2().then(resp=>{
            if(resp.code == 200) {
                this.setData({
                    UnusedCoupon: resp.data.list
                })
                console.log(this.data.UnusedCoupon)
            } else {
                that.$toast(resp.message);
            }
        }).catch(err=>{
            this.$networkErr();
        })
    },
    getInvalidCoupon(){ // 获取已过期优惠券
        let InvalidCoupon = this.data.InvalidCoupon; //未使用
        if(InvalidCoupon.length){  // 已经请求过的 直接return出去
            return;
        }
        personalApi.getCoupon3().then(resp=>{
            if(resp.code == 200) {
                this.setData({
                    InvalidCoupon: resp.data.list
                })
            } else {
                that.$toast(resp.message);
            }
        }).catch(err=>{
            this.$networkErr();
        })
    }
})

