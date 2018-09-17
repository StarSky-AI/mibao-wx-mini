const formatTime = (date,params) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()
  let link = '/';
  link = params.jsonMode=='through'?'-':'/';
  if(params.type="easy"){
    return [year, month, day].map(formatNumber).join(link)
  }
  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}
const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
const toFix = price => {  // 如你所见 他就这么点用
  return (Number(price)/100).toFixed(2);
}
const splitPrice = string => { // 取价格的整数位和小数  return出一个对象
  let int = '';
  let double = '';
  for(let i=0;i<string.length;i++){
    if(isNaN(Number(string[i]))){ // 碰到非数字则要停下来
      break;
    }else{
      int+=string[i];
    }
  }
  for(let i=string.length-1;i>=0;i--){
    if(isNaN(Number(string[i]))){ // 碰到非数字则要停下来
      break;
    }else{
      double=string[i] + double;
    }
  }
  return {
    int,
    double
  }
}
module.exports = {
  formatTime,
  toFix,
  splitPrice
}
