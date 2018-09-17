// components/picker/index.js
import commonApi from "../../api/common.js";
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      pickerHide:{
        type:Boolean,
          value:true
      },
      type:{
          type: String,
          value:"goods"
      },
      item:{ //商品信息 或者 店铺信息
          type:Object,
          value:()=>{
              return {}
            }
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
      animationData:{},//控件动画
      showCode:false,
      codeanimation:{},//二维码信息动画
      hideIcon:false,
      codeImg:'',//小程序码
      top:'',//截图区域距离左边
      left:'',
      width:'',
      height:'',
      loadingHide:true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
      scanCode(){
        wx.previewImage({
            urls: this.data.codeImg.split(',')
            // 需要预览的图片http链接  使用split把字符串转数组。不然会报错
        })
    },
      hideModal(){
          var animation = wx.createAnimation({
              duration: 200,
              timingFunction: "linear",
              delay: 0
          });
          this.animation = animation;
          animation.translateY(150).step();
          this.setData({
              animationData: animation.export(),
          });
          setTimeout(function () {
              animation.translateY(0).step();
              this.setData({
                  animationData: animation.export(),
                  pickerHide: true,
                  showCode:false,
                  hideIcon:false
              })
          }.bind(this), 200)
      },
      showModal: function () {
          var animation = wx.createAnimation({
              duration: 200,
              timingFunction: "linear",
              delay: 0
          });
          this.animation = animation;
          animation.translateY(150).step();
          this.setData({
              animationData: animation.export(),
              pickerHide: false,
              hideIcon:false,
          });
          setTimeout(function () {
              animation.translateY(0).step();
              this.setData({
                  animationData: animation.export()
              })
          }.bind(this), 200)
      },
      getQrcode(){
          this.setData({
              pickerHide:true,
              hideIcon:true,//隐藏控件
          });
          setTimeout(()=>{
              this.setData({
                  loadingHide:false
              });
          },20);
          console.log(this);
          let data={
              "path":this.data.item.path,
              "width":430,
              "autoColor":false,
              "lineColor":{
                  "r":"10",
                  "g":"10",
                  "b":"10"
              },
              "shareType":this.data.type,
          };
          if(this.data.type=='merchant')
          {
              data.scene=`merchantId=${this.data.item.merchantId}`
              data.shareId=this.data.item.merchantId
          }
          else
          {
              data.scene="goodsId="+this.data.item.goodsId
              data.shareId=this.data.item.goodsId
          }
          commonApi.xcxCode(data)
          .then(resp=>{
            console.log(resp);
            if(resp.code==200)
            {
                let qrCodeImg=resp.data;
                this.setData({
                    codeImg:qrCodeImg,
                    loadingHide:true,
                    showCode:true,//显示小程序码
                    pickerHide:false,
                });
            }
            else
            {
                this.$toast(resp.message)
                this.setData({
                    loadingHide:true,
                    pickerHide:false,
                })
                setTimeout(()=>{
                    this.setData({
                        pickerHide:true,
                    })
                },20)
            }
            })
              .catch(err=>{
                  this.setData({
                      loadingHide:true,
                      pickerHide:false,
                  })
                  setTimeout(()=>{
                      this.setData({
                          pickerHide:true,
                      })
                  },20)
                  this.$networkErr(err);
            })
      },
      queryMultipleNodes: function() { // 保存图片
          var _this=this;
          var query = wx.createSelectorQuery().in(this)
          query.select('#cnt').boundingClientRect(function (res) {
              console.log(res); // 这个组件内 #the-id 节点的上边界坐标
              _this.setData({
                  top:res.top,
                  left:res.left,
                  width:res.width,
                  height:res.height,
              });
              const ctx = wx.createCanvasContext('myCanvas');
              ctx.fillRect(_this.data.left, _this.data.top, _this.data.width, _this.data.height)
              ctx.draw(false, setTimeout(function () {
                  wx.canvasToTempFilePath({
                      x: _this.data.left,
                      y: _this.data.top,
                      width: _this.data.width,
                      height: _this.data.height,
                      destWidth: _this.data.width,
                      destHeight: _this.data.height,
                      canvasId: 'myCanvas',
                      success: function (res) {
                          console.log(res);
                          wx.saveImageToPhotosAlbum({
                              filePath: res.tempFilePath,
                              success(res){
                                  console.log(res);
                                  _this.hideModal();
                              }
                          })
                      },
                      fail(err){
                          console.log(err);
                      }
                  },_this)
              },100))
          }).exec();
      },
      save(){
          var _this=this;

      }
  }
})
