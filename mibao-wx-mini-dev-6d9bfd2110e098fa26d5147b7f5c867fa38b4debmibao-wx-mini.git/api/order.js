import fetch from './fetch.js';

/*订单模块api*/

const orderApi = {
    /*
     * 全部订单    all
     * 订单-进行中 leasing
     * 订单-已完成 finished
     * 订单-已取消 canceled
     */
    orderAllList: (data) => {
        return fetch({
            url: '/order/'+data.type+'/list',
            data: data,
            method: 'GET',
        });
    },
    /*
   * 取消订单
   */
    cancelOrder: (data) => {
        return fetch({
            url: '/order/cancelLeaseOrder/'+data.id,
            data: data,
            method: 'POST',
        });
    },
    /*
     * 订单物流信息
     * 参数： channel:user(查询用户接收快递信息)/merchant(查询商户接收快递信息)
     */
    orderLogisticsInfo:(data) => {
        return fetch({
            url: '/order/logisticsInfo/'+data.channel+'/'+data.id,
            data: data,
            method: 'GET',
        });
    },
    //物流列表
    getLogisticsCompany:()=>{
        return fetch({
            url:'/logistics/company/list',
            method:"GET"
        })
    },
//    租赁协议
    getAgreement:(data)=>{
        return fetch({
            url:`/order/ismtAgmtToView/${data.id}`,
            method:"GET",
            data:data
        })
    },
//    订单详情
    getOrderInfo:(data)=>{
        return fetch({
            url:'/order/'+data.id,
            method:"GET"
        })
    },
//    退还
    return:(data)=>{
        return fetch({
            url:'/order/goodsBack/'+data.id,
            method:"POST",
            data:data
        })
    },
//    /user/bonus/:goodsId/unused 优惠券
    getMyCoupon:(data)=>{
        return fetch({
            url:`/user/bonus/${data.goodsId}/unused`,
            method:"GET",
            data:data
        })
    },
//    用户生成归还二维码
    getReturnCode:(data)=>{
        return fetch({
            url:`/order/pushing/${data.id}/getRevertCode`,
            method:"GET",
            data:data
        })
    },
//    确认收货 /order/confirmReceipt/:id
    confirmReceipt:(data)=>{
        return fetch({
            url:`/order/confirmReceipt/${data.id}`,
            method:"PUT",
            data:data
        })
    },
//    账期支付 /order/bill/payment/wxpay/:id
    /*
    * userBonusId 用户代金券ID
    * isSelectDisposablePayment 是否一次性支付
    * id 订单id
    * payType wxpay
    *
    * */
    billPay:(data)=>{
        return fetch({
            url:`/order/bill/payment/wxpay/${data.id}`,
            method:"POST",
            data:data
        })
    },
//    订单支付 /order/payment/wxpay/:id
    /*
    * userBonusId 用户代金券ID
    * isSelectDisposablePayment 是否一次性支付
    * */
    orderPay:(data)=>{
        return fetch({
            url:`/order/payment/wxpay/${data.id}`,
            method:"POST",
            data:data
        })
    },
//    赔偿支付 /order/compensate/payment/{payType}/:id
       compensatePay:(data)=>{
           return fetch({
               url:`/order/compensate/payment/wxpay/${data.id}`,
               method:"POST",
               data:data
           })
       },
//    退还逾期支付/order/returnOverdue/payment/wxpay/:id
    returnoverDuePay:(data)=>{
        return fetch({
            url:`/order/returnOverdue/payment/wxpay/${data.id}`,
            method:"POST",
            data:data
        })
    },
//    订单取消支付 /order/canceledPayment/:id
    orderCancelPay:(data)=>{
        return fetch({
            url:`/order/canceledPayment/${data.id}`,
            method:"PUT",
            data:data
        })
    },
//    申请快速租赁 /order/quickLease/:id
    applyDepositPay:(data)=>{
        return fetch({
            url:`/order/quickLease/${data.id}`,
            method:"PUT",
            data:data
        })
    },
//    支付详情 /order/toPay/{id}
    detailPay:(data)=>{
        return fetch({
            url:`/order/toPay/${data.id}`,
            method:"GET",
            data:data
        })
    },
//    用户拒绝赔偿 详情和进度 /order/proofInfo/:id
    refuseCompensateDetail:(data)=> {
        return fetch({
            url: `/order/proofInfo/${data.id}`,
            method: "GET",
            data: data
        })
    },
//    用户拒绝赔偿 申请 /order/refuseCompensate/:id
    refuseCompensate:(data)=>{
        return fetch({
            url: `/order/refuseCompensate/${data.id}`,
            method: "PUT",
            data: data
        })
    },
//    订单催发货
    urgeDeliver:(data)=>{
        return fetch({
            url: `/order/reminder/${data.id}`,
            method: "PUT",
            data: data
        })
    },

};

export default orderApi;