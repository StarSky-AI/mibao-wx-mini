// 取消订单
import orderApi from '../../../api/order.js';
Page({

    /**
     * 页面的初始数据
     */
    data: {
        chooseIndex:null,
        cancelReasonObj: [
            {
                reason: "我不想租了",
                isChoosed: false
            }, {
                reason: "商品规格选错了",
                isChoosed: false
            }, {
                reason: "收货地址写错了",
                isChoosed: false
            }, {
                reason: "支付有问题",
                isChoosed: false
            }, {
                reason: "我要重新下单",
                isChoosed: false
            }, {
                reason: "测试下单/误下单",
                isChoosed: false
            }, {
                reason: "其他原因",
                isChoosed: false,
                needReason:true
            },
        ],
        textareaValue: '',   // “其他原因” 输入框内容
        chooseReason: '',     // 选中原因
        id: 0
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if(options.id) {
            this.setData({
                id: options.id
            });
        }
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    /*
      选择取消原因
    */
    chooseCancelReason(event) {
        let item = event.currentTarget.dataset.item || {};
        let index = event.currentTarget.dataset.index;

        this.setData({
            chooseIndex:index,
            chooseReason:item.needReason? this.data.chooseReason :item.reason,
        });
    },
    // 输入框填入文字-->选中“其他原因” ； 没有文字-->不选中
    // 传入参数：  textarea事件： event
    textareaInput(event) {
        let value = event.detail.value;
        if (value.trim()) {
            this.setData({
                chooseIndex: this.data.cancelReasonObj.length - 1,
                textareaValue: value.trim(),
                chooseReason: value.trim(),
            });
        }
    },
    /*
     * 提交取消原因
     */
    submitReason() {
        if (!this.data.id) {
            return ;
        }
        if (!this.data.chooseReason) {
            this.$toast('请选择取消订单原因');
            return ;
        }
        console.log(this.data.chooseReason)
        let params = {
            id: this.data.id,
            cancelReason: this.data.chooseReason
        };
        orderApi.cancelOrder(params).then(resp =>
        {
            if (resp.code === 200) {
                this.$toast('订单取消成功');
                setTimeout(()=>{
                    wx.navigateTo({
                        url:`/pages/order/orderDetail/orderDetail?id=${this.data.id}`
                    });
                },1000)

            } else {
                this.$toast(resp.message);
            }
        }).catch(e => {
            this.$networkErr(e);
        });
    },
    backToOrder(){
        wx.navigateTo({
            url:`/pages/order/orderList/orderList`
        });
    },
})
