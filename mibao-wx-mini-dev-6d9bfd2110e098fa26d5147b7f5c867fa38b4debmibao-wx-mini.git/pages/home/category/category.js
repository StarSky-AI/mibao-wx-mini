// pages/home/category/category.js
import homeApi from '../../../api/home.js';
import env from "../../../config/env";
const app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
      category:[
      ],
      categoryId:'',
      type:[],
      hasMore:true,
      pageNum:1,
      pageSize:10,
      typeImage:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      this.getCategory(options.cid);
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
    //渲染一级分类
    getCategory(id){
        homeApi.getCategory().then(resp=>{
            if(resp.code==200)
            {
                let data=resp.data||[];
                data.forEach((item,index)=>{
                    if(item.name=='全部')
                    {
                        data.splice(index,1)
                    }
                });
                if(!id)
                {
                    id=data[0].id;
                }
                this.setData({
                    categoryId:id,
                    category:data
                });
                this.getType(id);

            }
            else
            {
                this.$toast(resp.message)
            }
        }).catch(err=>{
           this.$toast(err.message)
        })
    },
    //获取二级分类接口
    getType(id){
      homeApi.getType({id:id}).then(resp=>{
          if(resp.code==200)
          {
              console.log(resp);
              let data=resp.data.typeList||[];
              data.forEach(item=>{
                  if(item.image.indexOf('http')===0)
                  {
                      item.src=item.image
                  }
                  else
                  {
                      item.src=env.image_host+item.image
                  }

              });
              if(resp.data.image.indexOf('http')===0)
              {
                  this.setData({
                      typeImage:resp.data.image
                  })
              }
              else
              {
                  this.setData({
                      typeImage:env.image_host+resp.data.image
                  })
              }
              this.setData({
                  type:data
              })
          }
          else
          {
              this.$toast(resp.message)
          }
      }).catch(err=>{
            this.$toast(err.message)
      })

    },
    //获取二级分类
    categoryClick(e){
        let id = e.currentTarget.dataset.cid;
        if(id == this.data.categoryId)
        {
            return;
        }

        this.setData({
            categoryId:id,
            hasMore:true,
            pageNum:1,
        });

        this.getType(id);
    },
    //到商品列表页
    goProducts(e){
        let tid = e.currentTarget.dataset.tid;
        wx.navigateTo({
            url: '/pages/home/list/list?categoryId='+this.data.categoryId+'&typeId='+tid
        })
    },
    //到搜索页面
    sousuo(){
        wx.navigateTo({
            url: '/pages/home/search/search'
        })
    }
})