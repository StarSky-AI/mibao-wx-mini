import xiaobaixinyong from '../../../images/base64/xiaobaixinyong.js';
import zhimaxinyong from '../../../images/base64/zhimaxinyong.js';
import personalApi from "../../../api/personal";
Page({
	/**
	 * 页面的初始数据
	 */
	data:{
        jdAuthorizationStatus: false,
		xiaobaixinyong: xiaobaixinyong,
		zhimaxinyong: zhimaxinyong
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.init();
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
	 * 用户点击右上角转发
	 */
	onShareAppMessage: function () {

	},

	/**
	 * 页面滚动触发事件的处理函数
	 */
	onPageScroll: function () {

	},

	/**
	 * 当前是 tab 页时，点击 tab 时触发
	 */
	onTabItemTap: function(item) {

	},
    init()
    {
        this.$login().then((data)=>{
        	let that = this;
            let jdAuthorizationStatus = this.data.jdAuthorizationStatus;

            personalApi.getInformation().then(resp=>{
                if(resp.code == 200) {
                	that.setData({
                        jdAuthorizationStatus: resp.data.jdAuthorizationStatus
					})
				}else {
                	$toast('网络连接失败')
				}
            })


        });
    },
})