import fetch from './fetch.js';

/*评论api*/

const commentApi = {
    comment:(data)=>{
        return fetch({
            url:`/comments/comment/${data.orderId}`,
            method:'POST',
            data:data
        })
    },
    ///comments/
    getComment:(data)=>{
        return fetch({
            url:`/comments/detail/${data.orderId}`,
            method:'GET',
            data:data
        })
    }
};

export default commentApi;