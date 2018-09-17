// pages/home/index/index.js
import homeApi from '../../../api/home.js';
import env from "../../../config/env";
const app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
      banner: {
          autoplay: true,
          current: 0,
          interval: 2000,
          duration: 1000,
          circular: false,
          preMargin: '0px',
          nextMargin: '0px',
          num: 1,
          type: '',
          dataId: '',
          index:0,
      },
      bannerList: [],
      goodsBean:{},
      category:[],
      showOldPrice1:false
  },
  
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.getIndex();
      this.getCategory();
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
          this.getIndex();
          this.getCategory();
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
    //banner和热门商品
    getIndex(){
        homeApi.getIndex().then(resp=>{
            if(resp.code==200)
            {
                let data = resp.data || {};
                let bannerList=data.bannerList||[];
                bannerList.forEach(item=>{
                    item.src = env.image_host + item.img;
                });

                let goodsBean=data.miniProgramIndexGoodsBean||[];
                goodsBean.mapList=goodsBean.mapList.slice(0,20);
                goodsBean.mapList.forEach(item=>{
                    let src=[];
                    let imgs=JSON.parse(item.imgUrl || '[]');
                    imgs.forEach(img=>{
                        if(img.url.indexOf('http')==0)
                        {
                            src.push(img.url)
                        }
                        else
                        {
                            src.push(env.image_host+img.url);
                        }

                    });
                    item.src=src;
                });

                this.setData({
                    bannerList:bannerList,
                    goodsBean:goodsBean,
                });
            }
            else
            {
                this.$toast(resp.message)
            }
        }).catch(err=>{
            this.$toast(err.message)
        })
    },
    //一级分类
    getCategory(){
        homeApi.getCategory().then(resp=>{
            if(resp.code==200)
            {
                // console.log(resp);
                let data=resp.data||[];
                data.forEach(item=>
                {
                    item.wxIcon = item.wechatIcon || ''; //没有zimaIcon字段则先赋值
                    if(item.wxIcon.indexOf('http') === 0)
                    {
                        item.src = item.wxIcon;
                    }
                    else
                    {
                        item.src = item.wxIcon? (env.image_host + item.wxIcon) : '/images/icon/ico-group.png';
                    }
                });

                //把最后一条全部先拿掉
                let last = data.pop() || {};
                //如果最后一条不是全部，则放回去
                if(last.id !== -1)
                {
                    data.push(last);
                }
                //分类最多取10条，超过后，第10条显示全部
                if(data.length>10)
                {
                    data = data.slice(0,9);
                    data.push({name:'全部',src:last.id===-1 ? last.src :'/images/icon/ico-group.png'});
                }

                this.setData({
                    category:data
                });
            }
            else
            {
                this.$toast(resp.message)
            }
        }).catch(err=>{
            this.$toast(err.message)
        })
    },
    //banner切换
    change(e) {
        //微信小程序如何使用setData修改data中子对象的属性值
        var index = 'banner.index';
        //不能轻易改变 current 用另一个变量
        this.setData({
            [index]: e.detail.current
        })
    },
    //去搜索页面
    sousuo() {
        wx.navigateTo({
            url: '/pages/home/search/search'
        })
    },
    categoryClick(e){
        let id=e.currentTarget.dataset.cid;
        if(id)
        {
            wx.navigateTo({
                url: '/pages/home/category/category?cid='+id
            })
        }
        else
        {
            wx.navigateTo({
                url: '/pages/home/category/category'
            })
        }
    },
    bannerClick(e) {
        let id = e.currentTarget.dataset.bid;
        let type = e.currentTarget.dataset.type;
        if(type == 'goods')
        {
            wx.navigateTo({
                url: '/pages/lease/detail/detail?goodsId=' + id
            });
        }
    },
    goodsClick(e){
        let id = e.currentTarget.dataset.gid;
        console.log(id);
        wx.navigateTo({
            url: '/pages/lease/detail/detail?goodsId=' + id
        });
    }
})