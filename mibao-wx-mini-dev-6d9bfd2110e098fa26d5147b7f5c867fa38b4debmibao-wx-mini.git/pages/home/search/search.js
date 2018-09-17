// pages/home/search/search.js
import homeApi from '../../../api/home.js';
import merchantApi from '../../../api/merchant.js';
import env from "../../../config/env";
import productListApi from '../../../templates/productsList/index.js'
import setHeight from '../../../utils/setScrollHeight.js';

const app=getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        hideDelicon:false,
        words: [],
        orderByTime: true,
        priceUp: false,//升序 价格上升
        list: [],
        pageSize: 10,
        pageNum: 1,
        hasMore: true,
        searchData: '',
        historyShow: false,
        historyRecords: [],//历史记录
        merchantId: '',
        top: 0,
        scrollHeight: 0,
        hide: true,
        fromMerchant:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (ops) {
        this.setScrollHeight();
        this.getHistory();
        if (ops.merchantId) {
            this.setData({
                merchantId: ops.merchantId,
                fromMerchant:true,
            })
        }
        else {
            this.getHotWords();
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
    // 设置滚动内容高度
    setScrollHeight() {
        var that = this;
        setHeight.api(that);
    },
    //热搜词
    getHotWords() {
        homeApi.hotWords().then(resp => {
            if (resp.code == 200) {
                let data = resp.data || [];
                this.setData({
                    words: data
                })
            }
            else {
                this.$toast(resp.message)
            }
        }).catch(err => {
            this.$toast(err.message)
        })
    },
    //  点击删除按钮
    reset(e) {
        this.setData({
            searchData: '',
            list: []
        });
        this.getHistory();
    },
    loadMore() {
        if (!this.data.hasMore) return;
        if (this.data.merchantId) {
            this.load(merchantApi, this.data.merchantId)
        }
        else {
            this.load(homeApi);
        }
    },
    //重置参数
    resetData() {
        this.setData({
            hasMore: true,
            pageNum: 1,
            orderByTime: true,
            priceUp: false,
        });
    },
    setSearchDate(e) {
        this.resetData();
        this.pushSearchToHistory();
        let name = e.currentTarget.dataset.name;
        this.setData({
            searchData: name
        });
        this.loadMore();
    },
    search() {
        const a = /^\s*$/g;//判断输入框为空
        if (a.test(this.data.searchData)) {
            //做一个弹框提示
            return;
        }
        this.pushSearchToHistory();
        //  重新搜索
        this.resetData();
        this.loadMore()

    },
    //封装请求数据过程
    load(api, id) {
        this.setData({
            hide: false
        });
        //封装搜索过程
        let data = {
            search: this.data.searchData,
            pageSize: this.data.pageSize,
            pageNum: this.data.pageNum,
            "orderBy": this.data.orderByTime ? 'putaway_time' : 'display_rent',
            "desc": this.data.orderByTime ? false : this.data.priceUp,
        };
        if (id) {
            data.merchantId = id;
        }
        api.search(data).then(resp => {
            // console.log(resp)
            if (resp.code == 200) {
                let data = resp.data.list || [];
                data.forEach(item => {
                    let src = [];
                    let imgs = item.imgUrl || [];

                    imgs.forEach((img) => {
                        if (img.url.indexOf('http') == 0) {
                            src.push(img.url);
                        }
                        else {
                            src.push(env.image_host + img.url);
                        }
                    });
                    item.src = src;

                    //    处理店铺名称 过长的中间显示省略号
                    if (item.shopName.length > 8) {
                        item.shopNameEnd = item.shopName.substr(item.shopName.length - 2, 2)
                    }
                });

                if (data.length < this.data.pageSize) {
                    console.log('没有更多了');
                    this.setData({
                        hasMore: false,
                    });
                }
                this.setData({
                    list: this.data.pageNum == 1 ? data : [...this.data.list, ...data],
                    pageNum: this.data.pageNum + 1,
                    hide: true
                });

            }
            else {
                this.$toast(resp.message)
            }
        })
            .catch(err=>{
                this.$toast(err.message)
            })
    },
    setOrderByTime() {
        // 时间
        if (!this.data.orderByTime) {
            this.setData({
                hasMore: true,
                orderByTime: !this.data.orderByTime,
                pageNum: 1,
                top: 0,
            });
            this.loadMore();
        }

    },
    setOrderByPrice() {
        //价格
        if (this.data.orderByTime) {
            this.setData({
                hasMore: true,
                orderByTime: !this.data.orderByTime,
                priceUp: false,
                pageNum: 1,
                top: 0,
            });
        }
        else {
            this.setData({
                hasMore: true,
                priceUp: !this.data.priceUp,
                pageNum: 1,
                top: 0,
            })
        }
        this.loadMore();
    },
    //下拉刷新
    topLoad(e) {
        this.resetData();
        this.loadMore();
    },
    //下拉加载
    lower(e) {
        this.loadMore();
    },
    scroll(e) {
        this.setData({
            scrollTop: e.detail.scrollTop
        });
    },
    //处理搜索历史
    pushSearchToHistory() {
        let tempRecords = [];
        let hasSame = false;
        let _this = this;
        wx.getStorage({
            key: 'searchHistory',
            success(res) {
                console.log(res);
                let value = res.data.searchHistory;
                console.log(value);

                if (value.length) {
                    tempRecords = value;
                    value.forEach(item => {
                        if (item == _this.data.searchData) {
                            hasSame = true;
                        }
                    });
                    if (!hasSame) {
                        if (tempRecords.length > 9) {
                            tempRecords.pop();
                        }
                        tempRecords.unshift(_this.data.searchData);
                        console.log(tempRecords);
                        wx.setStorageSync(
                            'searchHistory', {searchHistory: tempRecords}
                        )
                        _this.setData({
                            historyShow: false,
                            historyRecords: tempRecords
                        })
                    }
                }
                else {
                    tempRecords.unshift(_this.data.searchData);
                    console.log(tempRecords);
                    wx.setStorageSync(
                        'searchHistory', {searchHistory: tempRecords}
                    );
                    _this.setData({
                        historyShow: true,
                        historyRecords: tempRecords
                    })
                }
            }
        })
    },
    // 清空历史记录
    clearHistory() {
        try {
            wx.removeStorageSync('searchHistory')
        } catch (e) {
            // Do something when catch error
        }
        this.setData({
            historyRecords: [],
            historyShow: false,
        });
    },
    //历史词搜索
    fillSearch(e) {
        let name = e.currentTarget.dataset.name;
        this.resetData();
        this.setData({
            searchData: name,
        });
        this.loadMore();
    },
    // 获取历史记录
    getHistory() {
        try {
            var value = wx.getStorageSync('searchHistory').searchHistory;
            console.log(value);
            if (value) {
                // Do something with return value
                if (value.length) {
                    this.setData({
                        historyShow: true,
                        historyRecords: value
                    })
                }
                else {
                    this.setData({
                        historyShow: false,
                        historyRecords: []
                    })
                }
            }
            else {
                wx.setStorage({
                    key: 'searchHistory',
                    data:
                        {searchHistory: []}
                });
            }
        } catch (e) {

        }

    },
    //删除历史记录
    deleteHistory(e) {
        let index = e.currentTarget.dataset.index;
        let historys = this.data.historyRecords;
        historys.splice(index, 1);
        if (historys.length == 0) {
            this.setData({
                historyShow: false
            })
        }
        this.setData({
            historyRecords: historys
        });
        wx.setStorageSync(
            'searchHistory', {searchHistory: historys}
        )

    },
    toDetail(e) {
        console.log(e);
        productListApi.toDetail(e)
    },
    blur(e){
        this.setData({
            searchData:e.detail.value,
            hideDelicon:false,
        })
    },
    focus(){
        this.setData({
            hideDelicon:true,
        })
    }

});
