import fetch from './fetch.js';

/*认证api*/

const creditApi = {
  
  /**
   * 实名提交
   * @param data
   */
  postRealName:(data)=>{
    return fetch({
      url:'/face/realname',
      data:data,
      method:'POST',
    });
  },
  
  /**
   * 授权京东小白绑定
   * @param data
   */
  xiaobaiCallback:(data)=>{
    return fetch({
      url:'/xiaobai/callBack',
      data:data,
      method:'POST',
    });
  },
  
  
  /**
   * 查询信用分
   * @param data
   */
  queryCreditScore:(data)=>{
    return fetch({
      url:'/users/creditScore',
      data:data,
      method:'GET',
    });
  },
  
  /**
   * 查询当日是否需要扫脸
   * @param data
   */
  queryTodayFace:(data)=>{
    return fetch({
      url:'/face/verifyInfo',
      data:data,
      method:'POST',
    });
  },
  
  /**
   * 获取扫脸参数
   * @param data
   */
  queryFaceExtraData:(data)=>{
    return fetch({
      url:'/face/extraData',
      data:data,
      method:'POST',
    });
  },
  
  /**
   * 获取扫脸结果
   * @param data
   */
  queryFaceResult:(data)=>{
    return fetch({
      url:'/face/getResult/liveness',
      data:data,
      method:'POST',
    });
  },
  
};

export default creditApi;