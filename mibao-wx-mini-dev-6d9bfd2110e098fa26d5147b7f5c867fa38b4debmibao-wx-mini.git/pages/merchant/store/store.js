// pages/merchant/store/store.js
import env from "../../../config/env";
import merchantApi from "../../../api/merchant";
import setHeight from '../../../utils/setScrollHeight.js';
import shopLogo from '../../../images/base64/shoplogo.js';
import shopbg from '../../../images/base64/shopBG.js';

const app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
      activeTab:'a',
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
      hot:{},//热门
      newly:{},//新品上架
      list:[],//全部商品
      orderByTime:true,
      priceUp:false,//升序
      scroll_top:0,//滚动条位置
        gudingdingwei:false,//tab定位
      paixudingwei:false,//排序的固定定位
      storeHeight:0,//tab以上的高度
      hasMore:true,
      merchantId:'',
      isCollected:false,
      hide:true,
      pageNum:1,
      pageSize:10,
      top:0,//全部商品的滚动条
      scrollHeight:0,//全部商品的高度
      merchantInfo:{},
      pickerHide:true,
      animationData:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      if(options.scene){
          var getQueryString = new Object();
          var strs = decodeURIComponent(options.scene).split('&') //以&分割
          //取得全部并赋值
          for (var i = 0; i < strs.length; i++) {
              getQueryString[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
          }

          //&是我们定义的参数链接方式
          let merchantId=getQueryString['merchantId'];
          //其他逻辑处理。。。。。
            this.setData({
              merchantId:merchantId
          });
      }
      else
      {
            this.setData({
              merchantId:options.merchantId
          });
      }

   this.getStoreInfo();
  this.getIndex();
  this.getHeadHeight();//获取高度
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
  onShareAppMessage: function (res) {
      this.selectComponent("#share").hideModal();
      wx.showShareMenu({
          withShareTicket:true
      });
      console.log(res);
      if (res.from === 'button') {
          // 来自页面内转发按钮
          console.log(res.target.id)
        if(res.target.id=='store')
        {

        }
      }
      return {
          title:this.data.merchantInfo.shopName,
          path: '/pages/merchant/store/store?merchantId='+this.data.merchantId,
          imageUrl:env.image_host+this.data.merchantInfo.backgroundPicture
      }
  },
    getStoreInfo(){
      merchantApi.storeInfo({id:this.data.merchantId})
          .then(resp=>{
              console.log(resp);
              if(resp.code==200)
              {
                    let data=resp.data||{};

                    if(data.backgroundPicture)
                    {
                        if(data.backgroundPicture.indexOf('http')==-1)
                        {
                            data.backgroundPicture=env.image_host+data.backgroundPicture;
                        }
                    }
                    else
                    {
                        data.backgroundPicture=shopbg;
                    }

                   if(data.shopLogo)
                   {
                       if(data.shopLogo.indexOf('http')==-1)
                       {
                           data.shopLogo=env.image_host+data.shopLogo;
                       }
                   }
                  else
                  {
                      data.shopLogo=shopLogo;
                  }
                    data.merchantId=this.data.merchantId;
                  wx.setNavigationBarTitle({ title: data.shopName||'' });
                  this.setData({
                      merchantInfo:data
                  })

              }
              else
              {
                   this.$toast(resp.message)
              }
          })
          .catch(err=>{
              this.$networkErr(err);
          })
    },
    getIndex(){
        merchantApi.isCollect({id:this.data.merchantId}).then(resp=>{
            if(resp.code==200)
            {
                this.setData({
                    isCollected:resp.data
                })
            }
            else if(resp.code==401)
            {
                this.$login().then(()=>{
                    this.getIndex();
                })
            }
            else
            {
                this.$toast(resp.message)
            }
        }).catch(e=>{
            this.$networkErr(e);
        })
        merchantApi.storeIndex({id:this.data.merchantId}).then(resp=>{
            if(resp.code==200)
            {
                let data = resp.data || {};
                let bannerList=data.bannerList||[];
                bannerList.forEach(item=>{
                    if(item.imgUrl.indexOf('http')==0)
                    {
                        item.src = item.imgUrl;
                    }
                    else
                    {
                        item.src = env.image_host + item.imgUrl;

                    }

                });

                let hot=data.hot||{};
                hot.goodsList=hot.goodsList.slice(0,6);
                hot.goodsList.forEach(item=>{
                    if(item.img.indexOf('http')==0)
                    {
                        item.src = item.img;
                    }
                    else
                    {
                        item.src = env.image_host + item.img;
                    }
                });

                let newly=data.newly||{};
                newly.goodsList=newly.goodsList.slice(0,20);
                newly.goodsList.forEach(item=>{
                    if(item.img.indexOf('http')==0)
                    {
                        item.src = [].concat(item.img);
                    }
                    else
                    {
                        item.src = [].concat(env.image_host + item.img);
                    }
                });
                this.setData({
                    bannerList:bannerList,
                    newly:newly,
                    hot:hot
                });
            }
            else if(resp.code==401)
            {
                this.$login().then(()=>{
                    this.getIndex();
                })
            }
            else
            {
                this.$toast(resp.message)
            }
        }).catch(err=>{
            this.$networkErr(err);
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
    // 获取全部商品
    getAllProducts(){
        this.setData({
            hasMore:true,
            pageNum:1,
            orderByTime:true,
            priceUp:false,
        });
        this.loadMore();
    },
    loadMore(){
      if(!this.data.hasMore) return;
        this.setData({
            hide:false
        });
        //封装搜索过程
        let data={
            merchantId:this.data.merchantId,
            pageSize:this.data.pageSize,
            pageNum:this.data.pageNum,
            "orderBy": this.data.orderByTime?'putaway_time':'display_rent',
            "desc": this.data.orderByTime?false:this.data.priceUp,
        };

        merchantApi.search(data).then(resp=>{
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
        })
    },
    tabClick(e){
      this.bakToTop();
      let name=e.currentTarget.dataset.name;
      this.setData({
          activeTab:name,
      });
    //  获取内容
    if(name=='a')
    {
        this.getStoreInfo();
        this.getIndex();
    }
    else if(name=='b')
    {
        this.setScrollHeight();
        this.getAllProducts();
    }
    else
    {

    }

    },
    // 设置滚动内容高度
    setScrollHeight(){
        var that = this;
        setHeight.api(that);
    },
    //下拉刷新
    topLoad(e){
        this.loadMore();
    },
    //下拉加载
    lower(e){
        this.loadMore();
    },
    setOrderByTime(){
        // 时间
        if(!this.data.orderByTime)
        {
            this.setData({
                hasMore:true,
                orderByTime:!this.data.orderByTime,
                pageNum:1,
                top:0,
            });
            this.loadMore();
        }
    },
    setOrderByPrice(){
        //价格
        if(this.data.orderByTime)
        {
            this.setData({
                hasMore:true,
                orderByTime:!this.data.orderByTime,
                priceUp:false,
                pageNum:1,
                top:0,
            });
        }
        else {
            this.setData({
                hasMore:true,
                priceUp:!this.data.priceUp,
                pageNum:1,
                top:0,
            })
        }
        this.loadMore();
    },
    //回到顶部
    bakToTop(){
        var _top=this.data.scroll_top;//发现设置scroll-top值不能和上一次的值一样，否则无效，所以这里加了个判断
        if(_top==1){
            _top=0;
        }else{
            _top=1;
        }
        this.setData({
            scroll_top: _top
            });
    },
    // 搜索店内商品
    toSearch(){
        wx.navigateTo({
        url:"/pages/home/search/search?merchantId="+this.data.merchantId
        })
    },
    //客服
    toService(){
        wx.navigateTo({
          url:"/pages/personal/service/service"
      })
    },
    toAll(){
        this.setData({
            activeTab:'b',
        });
        this.bakToTop();
    //    获取接口
        this.setScrollHeight();
        this.getAllProducts();
    },
    getHeadHeight(){
        //创建节点选择器
        var query = wx.createSelectorQuery();
        var that = this;
        query.select('.store-header').boundingClientRect(function (rect) {
            that.setData({
                storeHeight: rect.height
            })
        }).exec();
    },
    scrollTopFun(e){
        let scrollTop=e.detail.scrollTop;
        //tab
        if(scrollTop>this.data.storeHeight)
        {
            this.setData({
                gudingdingwei:true
            })
        }
        else
        {
            this.setData({
                gudingdingwei:false
            })
        }
    //    排序
        if(this.data.activeTab=='b')
        {
            if(scrollTop>this.data.storeHeight)
            {
                this.setData({
                    paixudingwei:true
                })
            }
            else
            {
                this.setData({
                    paixudingwei:false
                })
            }
        }

    },
    cancelornot(_this){
        merchantApi.storeCollect({id:_this.data.merchantId})
            .then(resp=>{
                if(resp.code==200)
                {
                    _this.setData({
                        isCollected:!_this.data.isCollected
                    });
                    _this.$toast(resp.message)
                }
                else if(resp.code==401)
                {
                    //    请先登录
                    _this.$toast(resp.message)
                }
                else
                {
                    _this.$toast(resp.message)
                }
            })
            .catch(err=>{
                _this.$networkErr(err);
            })
    },
    //收藏/取消收藏
    collectStoreOrCel(){
      const _this=this;
        if(_this.data.isCollected)
        {
        //    取消
            wx.showModal({
                title: '提示',
                content: '确定取消收藏该店铺吗？',
                success: function(res) {
                    if (res.confirm) {
                        _this.cancelornot(_this);
                    } else if (res.cancel) {

                    }
                }
            })

        }
        else
        {
            wx.showModal({
                title: '提示',
                content: '确定收藏该店铺吗？',
                success: function(res) {
                    if (res.confirm) {
//    收藏
                        _this.cancelornot(_this);
                    } else if (res.cancel) {

                        console.log('用户点击取消')
                    }
                }
            })

        }
    },
    //监听热门推荐
    scroll(e){

    },
    showModel(){
        this.selectComponent("#share").showModal();
    },
    share(){

    },
    goodsClick(e){
        wx.navigateTo({
            url:"/pages/lease/detail/detail?goodsId="+e.currentTarget.dataset.id
        })
    }
})