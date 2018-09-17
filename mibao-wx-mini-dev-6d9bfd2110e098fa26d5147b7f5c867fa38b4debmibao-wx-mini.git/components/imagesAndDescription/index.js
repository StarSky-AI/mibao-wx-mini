// components/imagesAndDescription/index.js
const app=getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      desType:{
        type:String,
          value:'详细评价'
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      content:'',//评论内容
      imgList:[],//用于展示的图片列表
      tmpImgList:[],//上传至服务器获取路径
      commentImgUrl:[],//真实上传到评论接口
  },

  /**
   * 组件的方法列表
   */
  methods: {
      setContent(e){
          this.setData({
              content:e.detail.value
          });
          this.triggerEvent('receiveData',{imageUrl:this.data.commentImgUrl,content:this.data.content});

      },
      delPhote(e){
          let index=e.currentTarget.dataset.index;
          var imglist=this.data.imgList;
          var commentImgUrl=this.data.commentImgUrl;
          var tmpImgList=this.data.tmpImgList;
          tmpImgList.splice(index,1);
          imglist.splice(index,1);
          commentImgUrl.splice(index,1);
          this.setData({
              imgList:imglist,
              commentImgUrl:commentImgUrl,
              tmpImgList:tmpImgList,
          });
      },
      upLoadImg(){//这里触发图片上传的方法
          var _this=this;
          var pics=_this.data.tmpImgList;
          console.log(pics);
          app.upLoadImg({
              url:'aliFileUpload/imgFileUpload/comment',//这里是你图片上传的接口
              path:pics,//这里是选取的图片的地址数组
              getFile(resp){
                  //每次只上传一张图片
                  console.log(resp);
                  let data=resp.data;
                  var a=[{url:data}];
                  _this.setData({
                      commentImgUrl:[..._this.data.commentImgUrl,...a]
                  });
                  _this.triggerEvent('receiveData',{imageUrl:_this.data.commentImgUrl,content:_this.data.content});
              },
          })

      },
      chooseImage(){
          //调取图片相册接口
          let _this=this;
          wx.chooseImage({
              count: 4, // 默认9
              sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
              sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
              success: function (res) {
                  // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
                  var tempFilePaths = res.tempFilePaths;
                  console.log(tempFilePaths);

                  let imgList=[];
                  tempFilePaths.forEach(item=>{
                      let a={
                          url:item,
                      };
                      imgList.push(a)
                  });

                  _this.setData({
                      imgList:[..._this.data.imgList,...imgList],
                      tmpImgList:tempFilePaths
                  });
                  _this.upLoadImg();
              }
          })

      },
      previewImage(e){
          let index=e.currentTarget.dataset.index;
          var imgList = this.data.imgList||[];
          imgList=imgList.map(item=>{return item.url});
          wx.previewImage({
              current: imgList[index],
              urls: this.data.tmpImgList
          });
      },
  }
})
