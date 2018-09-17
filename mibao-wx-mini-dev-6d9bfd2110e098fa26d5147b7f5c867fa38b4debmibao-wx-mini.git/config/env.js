const config = 0; //1正式 0测试

let env = {};

if(config===1) //正式服
{
  env = {
    server_host:'https://m.mibaostore.com/',
    api_host: 'https://wx-miniprogram.mibaostore.com/v1_0_0/',
    image_host: 'https://img.mibaostore.com/',

    jd_bind:'https://opencredit.jd.com/oauth2/bind?merchantCode=58577778&callBack=',
    jd_bind_back:'https://m.mibaostore.com/oauth2/jdbindbackforwxmini.html',
  }
}
else //测试服
{
  env = {
    server_host:'http://m.mibaostore.cn/',
      // api_host: 'http://192.168.1.188:9010/v1_0_0/',
    api_host:'https://wx-miniprogram.mibaostore.cn/v1_0_0/',
    //   api_host:'http://192.168.1.39:9010/v1_0_0/',
    image_host: 'https://img.mibaostore.cn/',

    jd_bind:'https://opencredit-yf.jd.com/oauth2/bind?merchantCode=58577778&callBack=',
    jd_bind_back:'https://m.mibaostore.com/oauth2/jdbindbackforwxmini.html',
  }
}
export default env;