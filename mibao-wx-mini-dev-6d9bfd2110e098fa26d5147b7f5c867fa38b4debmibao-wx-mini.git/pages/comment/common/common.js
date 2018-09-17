// pages/comment/common/common.js
import commentApi from '../../../api/comment.js';
import env from '../../../config/env.js';
import {upLoadImg} from "../../../utils/upload";
const app=getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
      finish:false,//路由传递
      content:'',//接收的评论内容
      orderId:'',
      score:'',//评分
      commentImgUrl:[
      ],//接收上传的图片
      goodsInfo:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      console.log(options);
      this.setData({
          orderId:options.id,
            finish:options.finish=='false'?false:true,
          goodsInfo:JSON.parse(options.goodsInfo||'{}')
        });
      if(this.data.finish) this.getComment();
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
    // 获取评价
    getComment(){
      commentApi.getComment({orderId:this.data.orderId})
          .then(resp=>{
              if(resp.code==200)
              {
                  let data=resp.data||{};
                  let commentImgUrl=JSON.parse(data.commentImgUrl||'[]');
                  commentImgUrl.forEach(item=>{
                      if(item.url.indexOf('http')!=0)
                      {
                          item.url=env.image_host+ item.url;
                      }
                  });
                  this.setData({
                      commentImgUrl:commentImgUrl,
                      content:data.content,
                      score:data.score,
                  })
              }
              else if(resp.code==401)
              {
                  //    请先登录
                  this.$login().then(()=>{
                      this.getComment();
                  });
              }
              else
              {
                  this.$toast(resp.message)
              }
          }).catch(err=>{
          this.$networkErr(err);
      })
    },
    //提交评论
    commentSubmit(){
      const _this=this;
        wx.showModal({
            title: '提示',
            content: '确定提交评论吗？',
            success: function(res) {
                if (res.confirm) {
//    收藏
                    console.log(res);
                    let params={
                        score:_this.data.score,
                        content:_this.data.content,
                        commentImgUrl:JSON.stringify(_this.data.commentImgUrl),
                        // goodsImgUrl:'',
                        goodsId:_this.data.goodsInfo.goodsId,
                        goodsName:_this.data.goodsInfo.goodsName,
                        originalPrice:_this.data.goodsInfo.price,
                        orderId:_this.data.orderId,
                    };
                    if(!params.score)
                    {
                        _this.$toast('请填写评分');
                        return;
                    }
                    if(!params.content)
                    {
                        _this.$toast('请填写评论内容');
                        return;
                    }
                    if(!params.commentImgUrl)
                    {
                        _this.$toast('请上传评论图片');
                        return;
                    }
                    // console.log(params);
                    commentApi.comment(params)
                        .then(resp=>{
                            if(resp.code==200)
                            {
                                _this.$toast("评论提交成功");
                                wx.navigateTo({
                                    url:`/pages/order/orderDetail/orderDetail?id=${_this.data.orderId}`
                                });
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
                } else if (res.cancel) {

                    console.log('用户点击取消')
                }
            }
        })
    },
    //组件传递获取评分星星数
    rate(obj){
        console.log(obj.detail.rate)
        this.setData({
            score:obj.detail.rate
        })
    },
    previewImg(e){
        let index=e.currentTarget.dataset.index;
        var commentImgUrl = this.data.commentImgUrl||[];
        commentImgUrl=commentImgUrl.map(item=>{return item.url});
        console.log(commentImgUrl);
        wx.previewImage({
            current: commentImgUrl[index],
            urls:commentImgUrl
        });
    },
    getData(obj){
        console.log('asdasd');
        this.setData({
            commentImgUrl:obj.detail.imageUrl,
            content:obj.detail.content,
        })
    },
})