// pages/home/list/list.js
import listApi from '../../../api/goodslist.js';
import env from "../../../config/env";
import setHeight from '../../../utils/setScrollHeight.js';
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      list:[],
      pageNum:1,
      pageSize:10,
      hasMore:true,
      categoryId:'',
      typeId:'',
      hide:true,
      scrollHeight:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ids) {
      this.setData({
          typeId:ids.typeId,
          categoryId:ids.categoryId
      });
      //设置滚动区域高度
      this.setScrollHeight();
      this.getList()
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
      wx.stopPullDownRefresh();

      setTimeout(()=>{
          this.getList();

      },500);

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
    getList(){
      this.setData({
          pageNum:1,
          hasMore:true,
      });
        this.loadMore();
    },
    loadMore(){
        if (!this.data.hasMore) return;
        this.setData({
            hide: false
        });

        let params={
            pageSize:this.data.pageSize,
            pageNum:this.data.pageNum,
            categoryId:this.data.categoryId,
            typeId:this.data.typeId
        };
        listApi.getProducts(params).then(resp=>{
            console.log(resp)
            if(resp.code==200)
            {
                let data=resp.data.list||[];
                data.forEach(item=>{
                    let src = [];
                    let imgs = item.imgUrl || [];

                    imgs.forEach((img)=>{
                        if(img.url.indexOf('http') == 0)
                        {
                            src.push(img.url);
                        }
                        else
                        {
                            src.push(env.image_host + img.url);
                        }
                    });
                    item.src = src;

                    //    处理店铺名称 过长的中间显示省略号
                    if (item.shopName.length > 8) {
                        item.shopNameEnd = item.shopName.substr(item.shopName.length - 2, 2)
                    }
                });

                if(data.length<this.data.pageSize)
                {
                    console.log('没有更多了');
                    this.setData({
                        hasMore:false,
                    });
                }
                this.setData({
                    list:this.data.pageNum==1?data:[...this.data.list, ...data],
                    pageNum:this.data.pageNum+1,
                    hide:true
                });
            }
            else
            {
                this.$toast(resp.message)
            }
        })
            .catch(err=>{
                this.$toast(err.message)
            })
    },
    // 设置滚动内容高度
    setScrollHeight() {
        var that = this;
        setHeight.api(that);
    },
    //上拉加载
    lower(e) {
        this.loadMore();
    },
});