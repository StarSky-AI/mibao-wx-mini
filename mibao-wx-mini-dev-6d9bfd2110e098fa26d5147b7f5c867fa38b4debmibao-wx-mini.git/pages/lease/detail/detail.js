import goodsApi from '../../../api/goods.js';
import util from '../../../utils/util.js';
import WxParse from "../../../templates/wxParse/wxParse.js"; // 将文本解析为HTML
let app = getApp();
Page({
  data: {
    goodsDetail:{}, // 商品所有的数据
    goodsId:'',// 存储的goodsId
    animationData: {}, // tips 的动画
    bindData:'', // 微信parse 解析过的wxml
    pageInfo:{
      collect:false,
      item:{}, // item 是生成二维码的参数
      detail:{},  // 商品详情价格那一块的详情
      specJson:{},// 商品规格 如果是固定租期 则规格里边含天数选择
      inputDays:'', // 用户自定义租赁日期的天数
      leaseDays:'', // 固定选择天数的天数
      installmentCount:'', // 期数
      Pay:'',// 支付金额
      rentCount:0, // 累计下单
      totalRent:0, // 总租金
      totalPriceInt:0, // 总租金的整数部分
      totalPriceDouble:0, // 总租金的小数部分
      modalTitle:'租金详情',
      modalBtnText:'立即下单',
      activityId:'', // 活动ID
      stock:0, // 规格库存
      serverDescription:[], // server_agement
      parameters:[], // 商品参数
      comment:[], // 商品评论
      star:['','','','',''],// 星星数组
      tab:[   // tab选项
        {
          text:'图文详情',
          select:true
        },
        {
          text:'商品参数',
          select:false
        },
        {
          text:'租赁规则',
          select:false
        },
        {
          text:'商品评论',
          select:false
        }
      ],
      leaseImg:'/images/lease.png', // 租赁流程图
      tips:[], // 提示rentGroup  即 租金**天 租金多少 
    },
    pageControl:{
      viewShow:false,// 控制页面展示
      pickerHide:true, // 控制展示二维码背景
      duration: 300,  // 动画时长
      dotIndex:0, // 当前dot索引
      tabIndex:0,  // 当前tab
      hideModal:true, //控制modal的~
      modalType:'',// 弹窗类型 0 租金  1 服务协议  2  选规格
      submitDisable:true,
      amtionFlag:false,
      windowH:0,
      fixShow:true,
      focus:false,
      enabled:true  // 判断商品是否可以预约 true可以 false不可以
    },
  },
  onLoad(query){  // 拿goodsId 获取商品信息
    wx.showLoading({
      title: '加载中',
    })
    if(query.scene){ // 如果是分享进来的 会带这些参数 取goodsId
      var getQueryString = new Object();
      var strs = decodeURIComponent(query.scene).split('&') //以&分割
      //取得全部并赋值
      for (var i = 0; i < strs.length; i++) {
          getQueryString[strs[i].split('=')[0]] = unescape(strs[i].split('=')[1])
      }
      //&是我们定义的参数链接方式
      let goodsId=getQueryString['goodsId'] || null;
      //其他逻辑处理。。。。。
      this.setData({
          goodsId:goodsId
      });
    }else{
      let goodsId = query.goodsId || null; // 获取参数带过来的goodsId
      this.setData({
        goodsId:goodsId
      })
    }
    let that = this;
    this.initAnimation(); // 初始化动画
    goodsApi.getDetail({goodsId:this.data.goodsId}).then(resp => {
      if(resp.code == 200){

        let data = resp.data || {};

        let enabled = data.enabled;

        if(!enabled){   // 不可预约
          this.setData({
            'pageControl.enabled':enabled,
            'pageControl.submitDisable':true,
            'pageInfo.modalBtnText':'补货中'
          })
        }
        let detail= {    // 渲染在页面的价格那一块的东西
          name:data.name,
          subtitle:data.oldLevelStr,
          originPrice:util.toFix(data.originalPrice),  // 商品原价 与租金无关
          defaultRent:util.toFix(data.displayRent),  //默认价格 其实就是多少元起  如果有活动 则是活动价最低多少起
          oldDefaultRent:'', // 商品活动状态下的旧租金
          activityStatus:data.activityStatus
        };
        let spec = data.displaySpecificationCombination;
        if (detail.activityStatus) {  // 此商品的活动状态 
          detail.defaultRent = util.toFix(spec.rent); //活动状态下的活动最低价
          detail.oldDefaultRent = util.toFix(spec.originalRent); // 活动下的原租金的最低值
       } 
       let specJson = data.specificationJson;  // 拿到商品的规格
       let displaySku = data.displaySku || [];
       if (!data.customLease) { // 非自定义租赁日期
          let leaseDaysArr = data.leaseDays.split(",");
          specJson.push(   // push租期
                {
                    specification: "leaseDay",
                    specificationJson: leaseDaysArr,
                    specificationName: "租期"
                }
            ) 
          let days = Number(displaySku[displaySku.length-1]);
          let installmentCount = Math.ceil(days / 30);
          this.setData({
            'pageInfo.installmentCount':installmentCount,
            'pageInfo.leaseDays':days
          })
        } else { 
            // 自定义租期的逻辑
            let minLease = data.minLease;
            let maxLease = data.maxLease;
            let defaultDay = data.displaySpecificationCombination.leaseDay;
            let installmentCount = Math.ceil(defaultDay / 30); // 期数
            let tips = JSON.parse(spec.rentGroup || '[]');
            this.setData({    // 设置默认的天数
                'pageInfo.installmentCount':installmentCount,
                'pageInfo.inputDays':defaultDay,
                'pageControl.minLease':minLease,
                'pageControl.maxLease':maxLease,
                'pageInfo.tips':tips,
            })
        }
        //  displaySku // 默认规格
        specJson.forEach((item,index)=>{
          item.specificationJson.forEach((subItem,subIndex)=>{
            if(subItem == displaySku[index]){
              item.select = subIndex;
            }
          })
        })
        let pictDetailALL = data.introduceDetail;
        WxParse.wxParse('pictDetailALL', 'html', pictDetailALL, this, 5);
        this.setData({  // 设置要放在最下边  设置完成即可让loading消失
          'pageInfo.rentCount':data.rentCount,
           goodsDetail:data,
          'pageInfo.detail':detail,
          'pageInfo.specJson':specJson
        })
        this.getParameters('init'); // 获取一下商品规格详情
        this.getComment('init'); // 获取一下评论列表
        this.getCollectGoods(); // 获取此商品是否收藏
        this.chooseSku();
        wx.hideLoading();
        this.setData({
          'pageControl.viewShow':true
        })
      }else{
        this.$toast(resp.message)   // 请求状态不对的处理
      }
    }).catch(err=>{   // 网络异常的处理
        this.$networkErr();
    });
  },
  getFocus(){
    this.setData({
      'pageControl.focus':true
    })
  },
  toMerchant(){
    let merchantId = this.data.goodsDetail.merchantId;
    if(merchantId){
      wx.navigateTo({
        url:`/pages/merchant/store/store?merchantId=${merchantId}`
      })
    }
  },
  toServer(){ // 跳转客服页
    wx.navigateTo({
      url:'/pages/personal/service/service'
    })
  },
  scroll(){
    let that = this;
    var query = wx.createSelectorQuery();
    query.select('#tab').boundingClientRect()
    query.exec(function (res) {
      let top = res[0].top;
      if(top<=0){
        that.setData({
          'pageControl.fixShow':false
        })
      }else{
        that.setData({
          'pageControl.fixShow':true
        })
      }
    })
  },
  getCollectGoods(){
    let merchantId = this.data.goodsDetail.merchantId;
    let goodsId = this.data.goodsId;
    let data = {
      merchantId,
      goodsId
    }
    goodsApi.getCollectGoods({...data}).then(resp => {  
      if(resp.code==200){
        this.setData({
          'pageInfo.collect':resp.data
        })
      }else if(resp.code == 401){ // 用户未登陆  因为是在打开详情页的时候直接请求 所以不强制登陆

      }
      }).catch(err => {
        // this.$networkErr();
    })
  },
  collectGoods(){  // 无论收藏还是取消收藏都在这里操作
    let that = this;
    let merchantId = this.data.goodsDetail.merchantId;
    let goodsId = this.data.goodsId;
    let data = {
      merchantId,
      goodsId
    }
    let collect = this.data.pageInfo.collect; // true为已收藏  false 为未收藏
    let content = "";
    if(collect){
      content = "确认取消收藏此商品?";
    }else{
      content = "确认收藏此商品?";
    }
    wx.showModal({
      title: '提示',
      content,
      success: function(res) {
        if (res.confirm) {
          goodsApi.controlCollectGoods({...data}).then(resp => {  // 如果未收藏 则要变成收藏
            if(resp.code==200){
              that.$toast(resp.message);
              that.setData({
                'pageInfo.collect':!collect
              })
            }else if(resp.code==401){
              this.$login().then(()=>{
                that.collectGoods();
              });
            }else{
              that.$toast(resp.message)
            }
            }).catch(err => {
              that.$networkErr();
          })
        }
      }
    })
  },
  iptDay(e){ // 用户输入天数
    let minDay = Number(this.data.pageControl.minLease);
    let maxDay = Number(this.data.pageControl.maxLease);
    let days = e.detail.value;
    if(days.indexOf('天')>-1){ // 如果有天  则要先把天拿掉  只要天前边的东西 以防止用户在后边继续输入
     let dayArr = days.split('');
     let newArr = [];
     for(let i=0;i<dayArr.length;i++){  // 如果用户输入了非数字 （其实Number类型的输入框是不可能出现的）则把非数字之前的数字拿出来 其他删掉
      if((Number(dayArr[i]))>=0){
        newArr.push(dayArr[i])
      }else{
        break;
      }
     }
     days = Number(newArr.join(''));
    }
    if(days<minDay || days==''){// 如果用户把输入框里的内容都删掉了 取最低天数
      days = minDay;
      this.$toast('抱歉,该商品租赁最小天数为 ' + minDay +' 天');
    }
    if(days>maxDay){
      days = maxDay;
      this.$toast('抱歉,该商品租赁最大天数为 ' + maxDay +' 天');
    }
    let installmentCount = Math.ceil(days / 30);
    this.setData({
      'pageInfo.inputDays':days,
      'pageInfo.installmentCount':installmentCount
    })
    this.chooseSku();
  },
  initAnimation(){
    var animation = wx.createAnimation({   // 创建个动画
      duration: 200,
  	  timingFunction: 'linear',
    })
    this.animation = animation;
  },
  controlTips(){ // 控制tips的动画
    let flag = this.data.pageControl.amtionFlag;
    if(!flag){ // open
      this.openTips();
    }else{ // close
      this.closeTips();
    }
  },
  openTips(){
    let animation = this.animation;
    let length = this.data.pageInfo.tips.length;
    let height = 30*length + 70 +'rpx';
    animation.height(height).step();
    this.setData({
      'pageControl.amtionFlag':true
    })
    this.setData({
      animationData:animation.export()
    })
  },
  closeTips(){
    let animation = this.animation;
    let height='70rpx';
    animation.height(height).step();
    this.setData({
      animationData:animation.export()
    })
    setTimeout(()=>{
      this.setData({
        'pageControl.amtionFlag':false
      })
    },200)
  },
  chooseSku(e){ // 点击某个sku 或者输入天数 都要触发
    let enabled = this.data.pageControl.enabled;
    let specJson = this.data.pageInfo.specJson;
    if(e){
      let indexObj = e.currentTarget.dataset;
      let index = indexObj.index;
      let subIndex = indexObj.subindex;
      if(specJson[index].select == subIndex){
        return;
      }else{ 
        specJson[index].select = subIndex;
      }
      if(specJson[index].specification=='leaseDay'){
        let days = specJson[index].specificationJson[specJson[index].select];
        let installmentCount = Math.ceil(days / 30);
        this.setData({
          'pageInfo.leaseDays':days,
          'pageInfo.installmentCount':installmentCount
        })
      }
      this.setData({
        'pageInfo.specJson':specJson
      })
    }
    let doRequest = true,params= {
      goodsId:this.data.goodsId
    };
    for(let i=0;i<specJson.length;i++){  // doRequest控制是否发起请求获得价格。 // 这里保证所有规格都已选择
      if(!(specJson[i].select>=0)){ // 如果未选择 都是 -1 
        doRequest=false;
        break;
      }
    }
    specJson.forEach(item => {
        params[item.specification]=item.specificationJson[item.select];// 生成发请求的参数
    })
    if(!params.leaseDay){ // 没天数是自定义期限
        params.leaseDay = this.data.pageInfo.inputDays;
    }
    if(!params.leaseDay){ // 这里保证在自定义租期的模式下  有天数
      doRequest=false;
    }
    if(doRequest){
      
      this.getPrice(params); // 获取价格
    }else{
      if(!enabled){
        return;
      }
      this.setData({
          'pageControl.submitDisable':true,
          'pageInfo.modalBtnText':'立即下单',
          'pageInfo.detail.chooseRent':''
      })
    }
  },
  getPrice(params) {
    let enabled = this.data.pageControl.enabled;
    goodsApi.getGoodsPrice(params).then(resp => {
        if(resp.code==200){
            let result = resp.data || {};
            let activityStatus = result.activityStatus;
            let spec = result.goodsSpecificationCombination;
            if(spec.stock>0){ // 库存大于0的状态
              this.setData({
                'pageInfo.stock':spec.stock
              })
              if(enabled){
                this.setData({
                  'pageControl.submitDisable':false,
                  'pageInfo.modalBtnText':'立即下单'
                })
              }
            }else{
                if(enabled){
                  this.$toast('补货中');
                  this.setData({
                      'pageInfo.stock':0,
                      'pageControl.submitDisable':true,
                      'pageInfo.modalBtnText':'补货中'
                  })
                }
            }
            let detail = this.data.pageInfo.detail;
            if(activityStatus){ // 此规格参与活动
                detail.oldDefaultRent = util.toFix(spec.originalRent); 
                detail.chooseRent = util.toFix(spec.rent);
                this.setData({
                    'pageInfo.activityId':spec.activityId
                })
                
            }else{ //  不参与活动。判断天数区间
                this.setData({
                    'pageInfo.activityId':''
                })
                if(this.data.goodsDetail.customLease){// 不参与活动 自定义租期  
                    let rentGroup = JSON.parse(spec.rentGroup ||'[]');
                    let rent = Number(spec.rent);
                      // 低于区间的天数取这个默认值
                    let inputDays = this.data.pageInfo.inputDays;
                    let chooseRent = 0;
                    rentGroup=rentGroup.sort((a,b)=>{
                        return a.day<b.day
                    })
                    let sectionPrice = false;
                    for(let i=0;i<rentGroup.length;i++){
                        if(inputDays>=rentGroup[i].day){
                            chooseRent = util.toFix(rentGroup[i].rent);
                            sectionPrice = true;
                            break;
                        }
                    }
                    if(!sectionPrice){ // 区间未找到合适的价格
                        chooseRent = util.toFix(rent);
                    }
                    detail.chooseRent = chooseRent;
                }else{ // 不参与活动 固定租期
                    detail.chooseRent = util.toFix(spec.rent);
                }
            }
            let days = 0;
            if(this.data.goodsDetail.customLease){ // 自定义租期
              days = this.data.pageInfo.inputDays;
            }else{
              days = this.data.pageInfo.leaseDays;
            }
            let baseRent = Number(detail.chooseRent)*100;
            let Pay = 0;
            if(days>30){  // 计算首付
              Pay = baseRent*30;
            }else{  // 计算总金额
              Pay = baseRent*days;
            }
            let totalRent = util.toFix(baseRent * Number(days));
            let totalPriceInt = util.splitPrice(totalRent).int;
            let totalPriceDouble = util.splitPrice(totalRent).double;
            // 根据用户当前选择的规格算总价
            this.setData({
              'pageInfo.Pay':util.toFix(Pay),
              'pageInfo.totalRent':totalRent,
              'pageInfo.totalPriceInt':totalPriceInt,
              'pageInfo.totalPriceDouble':totalPriceDouble,
            })
            detail.activityStatus = activityStatus;
            detail.originPrice = util.toFix(spec.originalPrice);
            this.setData({
                'pageInfo.detail':detail,
            });
        }else{
          if(enabled){
            this.$toast('补货中');
            this.setData({
                'pageInfo.stock':0,
                'pageControl.submitDisable':true,
                'pageInfo.modalBtnText':'补货中'
            })
          }
        }
    }).catch(err => {
      this.$networkErr();
  })
  },
  changeModal(e){  // 点不同的地方要显示不同的modal内容 这里处理
    let enabled = this.data.pageControl.enabled;
    let type = e.currentTarget.dataset.type;
    let modalType = 0;
    let modalTitle = '';
    let modalBtnText = '';
    if(type == 'rent'){
      modalType=0;
      modalTitle = '租金详情';
      if(enabled){
        modalBtnText = '立即下单';
      }else{
        modalBtnText = '补货中';
      }
    }else if(type == 'server'){ //  modalType:'',// 弹窗类型 0 租金  1 服务协议  2  选规格
      modalType=1;
      modalTitle = '服务协议';
      modalBtnText = '确定';
    }else if(type =='order'){
      modalType=2;
      modalTitle = '';
      if(enabled){
        modalBtnText = '立即下单';
      }else{
        modalBtnText = '补货中';
      }
    }
    this.setData({
      'pageControl.modalType': modalType,
      'pageInfo.modalTitle' : modalTitle,
      'pageInfo.modalBtnText': modalBtnText
    })
    this.showModal();
  },
  pageBtnClick(){
    let isSubmit = this.data.pageControl.submitDisable;
    if(isSubmit){  // 各种情况导致的无法下单  最突出的是库存不足
      return;
    }else{ // 收集参数前往确认订单页
      wx.showLoading({
        title: '下单中,请稍候...',
      })
      this.setData({
        'pageControl.submitDisable':true,
        'pageInfo.modalBtnText':'下单中'
      })
      // 确认订单页需要的参数是:    // 在这个页面全部处理
      // 商品名称 
      // 选择的规格
      // 当前选择规格的租金
      // 当前租赁天数
      // 当前天数计算出的期数
      // 意外保险情况   
      // 优惠礼券  //优惠券带不过去 因为没有意外保险的选择情况  无法拿到准确的优惠券
      this.$login().then(()=>{
        let goodsDetail = this.data.goodsDetail;
        let pageInfo = this.data.pageInfo;
        let detail = pageInfo.detail;
        let insurance = {
          control:!!goodsDetail.insuranceSwitch // 保险开关
        };
        if(insurance.control) { 
          insurance.Mandatory = !!goodsDetail.insuranceMandatory; // 保险是否必选
          insurance.choose = !!insurance.Mandatory;  // 保险当前选择
          insurance.price = goodsDetail.accidentInsurance; // 保险金额
          insurance.rentTitle = goodsDetail.insurances["0"].insuranceName; //保险名称
          insurance.rentContent =  goodsDetail.insurances["0"].detail; //保险详情
          if(goodsDetail.accidentInsurance<=0){
            insurance.rentsubtit = "（赠送）";
          }else if (insurance.Mandatory&&insurance.price > 0) { //如果是必选 并且 意外保险金大于0 
            insurance.rentsubtit = "（必选）";
          }else{
            insurance.rentsubtit = "";
          }
        }
        let spec = pageInfo.specJson;
        let sku = spec.map((item,index)=>{
          return {
            specification:item.specification,
            chooseSku:item.specificationJson[item.select]
          }
        })
        if(sku[sku.length-1].specification!='leaseDay'){ // 如果最后一个不是leaseDay  说明是自定义租赁
          sku.push({
            specification:'leaseDay',
            chooseSku:goodsDetail.customLease?pageInfo.inputDays:pageInfo.leaseDays
          })
        }
        let params = {
          whiteListed:goodsDetail.whiteListed, // 商品是否白名单
          msg: '',
          activityId:this.data.pageInfo.activityId,
          checked:false,
          coupon:{ 
            price:'',   // 优惠券价格
            id:''     // 优惠券ID
          },
          merchantId:goodsDetail.merchantId,
          deliveryWay:goodsDetail.deliveryWay,
          deposit:Number(detail.originPrice)*100,
          goodsId:goodsDetail.id,
          pic:goodsDetail.imgJson[0].url,
          name:goodsDetail.name, // 商品名称
          sku, // 选择的规格
          rent:Number(detail.chooseRent)*100, // 当前选择规格的租金
          days:goodsDetail.customLease?pageInfo.inputDays:pageInfo.leaseDays, // 当前租赁天数
          installmentCount:pageInfo.installmentCount, // 当前天数计算出的期数
          insurance, // 保险参数
        }; 
      wx.setStorageSync('orderInfo',params);
      wx.hideLoading();
      this.setData({
        'pageControl.submitDisable':false,
        'pageInfo.modalBtnText':'立即下单'
      })
      wx.redirectTo({
        url: '/pages/credit/index/index?url=/pages/lease/reservation/reservation'
      })
      // wx.navigateTo({
      //   url: '/pages/lease/reservation/reservation'
      // })
      });
    }
  },
  modalBtnClick(e){   // modal上的确认按钮  有两种可能  1 下单  2 确定关闭modal
    let modalType = this.data.pageControl.modalType;  //0 租金  1 服务协议  2  选规格
    if(modalType == 1){ // 服务协议 确认只用关闭modal
      this.selectComponent("#modal").hideModal();
    }else{ // 要进行下单 
      this.pageBtnClick();
    }
  },
  controlScroll(e){  // modal弹出的时候关闭页面滚动 以免滚动modal的时候页面也滚动
    this.setData({
      'pageControl.hideModal':e.detail.hideModal
    })
    if(e.detail.hideModal){
      
      let enabled = this.data.pageControl.enabled;
      let modalBtnText = this.data.pageInfo.modalBtnText;
      if(!enabled&&modalBtnText=='确定'){
        this.setData({
          'pageInfo.modalBtnText':'补货中'
        })
      }
    }
  },
  changeTab(e){  // change下边的tab卡
    let index = e.currentTarget.dataset.index;
    if(index==1){  // 初始化一下商品参数
      if(!this.data.pageInfo.parameters.length){  // 这里请求商品的规格/参数  因为不是所有用户都会去看 减少http 另外如果已经有商品规格和参数  则要return出去 避免重复请求
        this.getParameters();
      }
    }
    if(index==3){
      if(!this.data.pageInfo.comment.length){
        this.getComment();
      }
    }
    if(index==this.data.tabIndex){
      return;
    }
    this.setData({
      'pageControl.tabIndex':index
    })
  },
  getParameters(init){ // 获取规格参数  init 用来判断是否是初始化第一次请求规格参数   pageInfo.parameters 会在初始化赋值 如果接口错误或者网络问题 并不会做任何提示  如果没有赋值  则会在tabChange 的时候再次发起请求拿 规格参数  如果依然拿不到 则会提示错误类型
    let parameters = []; 
    goodsApi.getParameters({goodsId:this.data.goodsId}).then(resp=>{
      if (resp.code == 200) {
        let list = resp.data.list || [];
        list.map((item,index)=>{
          parameters = item.parametersList.map((subItem,subIndex)=>{
            return {
              title:subItem.parameterName,
              text:subItem.parameterValue
            }
          })
        })
        this.setData({
          'pageInfo.parameters':parameters
        })
      }else{
        if(!init){
          this.$toast(resp.message)
        }
        
      }
    }).catch(
      err=>{
        if(!init){
          this.$networkErr();
        }
      }
    );
  },
  getComment(init){ // 获取用户评论  init 用来判断是否是初始化第一次请求用户评论   pageInfo.parameters 会在初始化赋值 如果接口错误或者网络问题 并不会做任何提示  如果没有赋值  则会在tabChange 的时候再次发起请求拿 用户评论  如果依然拿不到 则会提示错误类型
    let parameters = []; 
    goodsApi.getGoodsCommentList({goodsId:this.data.goodsId,pageNum:1,pageSize:20}).then(resp=>{
      if (resp.code == 200) {
        let list = resp.data.list || [];
        list.forEach(item=>{
          item.commentImgUrl = JSON.parse(item.commentImgUrl || '[]');
          item.commentTime = util.formatTime(new Date(item.commentTime),{
            type :'easy',
            jsonMode:'through'
          })
        })
        this.setData({
          'pageInfo.comment':list
        })
      }else{
        if(!init){
          this.$toast(resp.message)
        }
      }
    }).catch(
      err=>{
        if(!init){
          this.$networkErr();
        }
        
      }
    );
  },
  changeDot(e){ // 手滑动轮播图时改变按钮样式
    let index = e.detail.current; 
    if(index==this.data.dotIndex){
      return;
    }
    this.setData({
      'pageControl.dotIndex':index
    })
  },
  showModal(){ // 被万众调用的showModal的方法
    this.selectComponent("#modal").showModal();
  },
  onShareAppMessage: function () {
    // return {
    //   title: '自定义转发标题',
    //   path: '/page/lease/detail/detail?id=123'
    // }
 },
 share(){  // 整理分享参数
   let goodsDetail = this.data.goodsDetail;
   let priceDetail = this.data.pageInfo.detail;
   let shareParams = {};
   shareParams.goodsId = this.data.goodsId; 
   shareParams.goodsName = priceDetail.name;
   shareParams.path = '/pages/lease/detail/detail';
   shareParams.img = goodsDetail.imgJson[0].url;
   shareParams.leaseType = goodsDetail.leaseType;
   shareParams.defaultRent = priceDetail.defaultRent;
   this.setData({
     'pageInfo.item':shareParams
   })
   console.log(this.data.pageInfo.item)
   this.selectComponent("#share").showModal();
 }
})