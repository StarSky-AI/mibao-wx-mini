const utils = {
  /**
   * 验证手机号是否正确
   * @param str
   * @returns {boolean}
   */
  validPhone: (str) =>
  {
    var pattern = /^1[3456789]\d{9}$/;
    if (pattern.test(str)) {
      return true;
    } else {
      return false;
    }
  },
  
  /**
   * 验证手机号和固话是否正确
   * @param str
   * @returns {boolean}
   */
  validPhoneAndTel: (str) =>
  {
    var pattern = /(^0\d{2,3}(-)?\d{7,8}$)/;
    if (utils.validPhone(str)||pattern.test(str)) {
      return true;
    } else {
      return false;
    }
  },
  
  /**
   * 验证姓名
   * @param str
   * @returns {boolean}
   */
  validName: (str) =>
  {
    var pattern = /^[\u4e00-\u9fa5]{2,8}$/;
    if (pattern.test(str)) {
      return true;
    } else {
      return false;
    }
  },
  
  /**
   * 验证身份证
   * @param str
   * @returns {boolean}
   */
  validCertNo: (str) =>
  {
    var pattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
    if (pattern.test(str)) {
      return true;
    } else {
      return false;
    }
  },
};

export default utils;