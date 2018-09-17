import fetch from './fetch.js';

/*示例api*/

const testApi = {
  /*test*/
  test1:(data)=>{
    return fetch({
      url:'/test1',
      data:data,
      method:'GET',
    });
  },
  
  /*test*/
  test2:(data)=>{
    return fetch({
      url:'/test2',
      data:data,
      method:'POST',
    });
  },
};

export default testApi;