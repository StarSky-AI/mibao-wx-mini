var setHeight={
    api:(that)=>{
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    scrollHeight: res.windowHeight
                });
            }
        });
    }
};
export default setHeight;
