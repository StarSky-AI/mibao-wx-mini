import utils from '../../utils/index';
import personalApi from '../../api/personal';
import env from '../../config/env';

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    phone:'', //手机号
    smsTime:0, //短信下一次发送倒计时
    smsCode:'',//短信验证码输入
    showCaptcha:false, //显示图片验证码
    captchaUrl:'',//图片验证码地址
    captcha:'',  //图片验证码输入
    random:'', //随机验证码
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 输入手机号*/
    inputPhone(e)
    {
      let phone = e.detail.value;
    
      this.setData({
        phone:phone,
      });
    
      if(utils.validPhone(phone))
      {
        this.getCaptcha();
      }
    
    },
    /**
     * 输入手机验证码*/
    inputSmsCode(e)
    {
      let smsCode = e.detail.value;
      this.setData({
        smsCode:smsCode
      });
    },
    /**
     * 输入图片验证码*/
    inputCaptcha(e)
    {
      let captcha = e.detail.value;
      this.setData({
        captcha:captcha
      });
    },
    /**
     * 获取图片验证码
     */
    getCaptcha()
    {
      let phone = this.data.phone;
      if(utils.validPhone(phone))
      {
        let random = new Date().getTime();
        this.setData({
          showCaptcha:true,
          random:random,
          captchaUrl:env.api_host + '/getCaptcha?phone=' + phone + '&random='+random,
        });
      }
      else
      {
        this.$toast('请输入正确的手机号');
      }
    },
    /**
     * 发送手机验证码
     */
    sendSmsCode()
    {
      if(this.data.smsTime > 0)
      {
        return;
      }
    
      let phone = this.data.phone;
      if(!utils.validPhone(phone))
      {
        this.$toast('请输入正确的手机号');
        return;
      }
    
      let captcha = this.data.captcha;
      if(!captcha)
      {
        this.$toast('请输入图片验证码');
        return;
      }
    
      //发送验证码
      this.setData({
        smsTime:60,
      });
    
      this.smsTimeDown();
    
      personalApi.sendPhoneCode({
        phone:phone,
        code:captcha,
        random:this.data.random,
      }).then(resp=>
      {
        if(resp.code===200)
        {
        
        }
        else
        {
          this.setData({
            smsTime:0,
          });
  
          this.$toast(resp.message);
        }
  
      }).catch(err=>{
        this.$networkErr(err);
      })
    
    },
    /**
     * 验证码发送倒计时
     */
    smsTimeDown()
    {
      let itr = setInterval(()=>{
        let time = --this.data.smsTime;
        this.setData({
          smsTime:time
        });
        if(time<=0)
        {
          clearInterval(itr);
        }
      },1000);
    
    },
    /**
     * 绑定提交
     */
    confirm()
    {
      
      let phone = this.data.phone;
      if(!utils.validPhone(phone))
      {
        this.$toast('请输入正确的手机号');
        return;
      }
    
      let smsCode = this.data.smsCode;
      if(!smsCode)
      {
        this.$toast('请输入短信验证码');
        return;
      }
    
      personalApi.bindPhone({
        phone:phone,
        code:smsCode,
      }).then(resp=>
      {
        if(resp.code===200)
        {
          this.triggerEvent('confirm', {success:true});
        }
        else
        {
          this.$toast(resp.message);
        }
      }).catch(err=>{
        this.$networkErr(err);
      })
    },
  }
});
