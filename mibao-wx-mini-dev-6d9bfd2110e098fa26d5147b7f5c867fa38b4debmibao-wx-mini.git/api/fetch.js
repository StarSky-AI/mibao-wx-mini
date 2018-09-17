import env from '../config/env.js';

let service = (config) => {
  return new Promise((resolve, reject) => {
    wx.request({
      header: {
        'Content-Type': (config.header && config.header['Content-Type']) || "application/json",
        'Cache-Control': "no-cache",
        'token':wx.getStorageSync('token'),
      },
      url: env.api_host + (config.url.indexOf('/') == '0' ? config.url.substr(1) : config.url),
      method: config.method,
      data: {...config.data, '_t': new Date().getTime(), 'token':wx.getStorageSync('token')},
      dataType: 'json',
      success: function (res) {
        resolve(res.data);
      },
      fail: function (res) {
        reject(res);
      },
      complete: function (res) {
      }
    });
  });
};

export default service;
