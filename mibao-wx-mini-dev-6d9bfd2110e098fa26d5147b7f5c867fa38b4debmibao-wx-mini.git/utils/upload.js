//上传文件
import env from '../config/env.js';
export function upLoadImg(data){

        var that=this,
            i=data.i?data.i:0,//当前上传的哪张图片
            success=data.success?data.success:0,//上传成功的个数
            fail=data.fail?data.fail:0;//上传失败的个数
        console.log(data)
        wx.uploadFile({
            url: env.api_host+data.url,
            filePath: data.path[i],
            name: 'file',//这里根据自己的实际情况改
            formData:null,//这里是上传图片时一起上传的数据
            success: (resp) => {
                console.log(resp);
                if(resp.statusCode==200)
                {
                    success++;//图片上传成功，图片上传成功的变量+1
                    console.log(i);
                    data.getFile(JSON.parse(resp.data))
                }
            },
            fail: (res) => {
                console.log(res);
                fail++;//图片上传失败，图片上传失败的变量+1
                console.log('fail:'+i+"fail:"+fail);
            },
            complete: () => {
                console.log(i);
                i++;//这个图片执行完上传后，开始上传下一张
                if(i==data.path.length){   //当图片传完时，停止调用
                    console.log('执行完毕');
                    console.log('成功：'+success+" 失败："+fail);

                }else{//若图片还没有传完，则继续调用函数
                    data.i=i;
                    data.success=success;
                    data.fail=fail;
                    that.upLoadImg(data);
                }

            }
        });

}