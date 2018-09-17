Page({

  data: {
    params:{},
    cha:0,
    arr:[]
  },
  onLoad: function (options) {
    this.setData({
      params:wx.getStorageSync('orderInfo')
    })
    let params = this.data.params;
    console.log(params)
    let arr = this.data.arr;
    let baseRent = params.rent; // 基本租金
    let desp = params.deposit; // 押金
    let checked = params.checked; // 选中押金
    let coupon = params.coupon; // 用户是否选中优惠券
    let control = params.insurance.control; // 是否有保险
    let insu = false;
    let insuPrice = 0;
    if(control){
      insu = params.insurance.choose; // 用户是否选中保险
      if(insu){
        insuPrice = params.insurance.price; // 用户选择了保险 
      }
    }
    for(let i = 0;i<params.installmentCount;i++){
      let rent = 0;
      if(i==0){ // 第一期
        if(params.installmentCount>1){ // 多期
          rent = baseRent*30; // 租金
        }else{  //1期
          rent = baseRent*params.days; // 租金
        }
        if(insuPrice){ // 如果用户选择了保险 加上保险
          rent += insuPrice;
        }
        if(coupon.price){ // 用户选择了优惠券
          let oldRent = rent;
          rent -= coupon.price;
          rent=rent<0?0:rent;  // 如果租金加上保险减去优惠券小于0 则为0
          this.setData({
            cha:oldRent-rent
          })
        }
        if(checked){ // 如果用户选择了押金   加上押金
          rent += desp;
        }
        arr.push(rent)
      }else{ //说明是多期
        if(i == params.installmentCount-1){ // 最后一期 天数不一定够30天
          let day = params.days-(30*i);
          rent = baseRent*day;
          arr.push(rent)
        }else{
          rent = baseRent*30;
          arr.push(rent)
        }
      }
    }
    this.setData({
      arr:arr
    })
  }
})