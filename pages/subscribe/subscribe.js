// pages/subscribe/subscribe.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOpenPush: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()
    this.setData({
      isOpenPush: app.push.isOpenPush()
    })
  },

  switchChange: function (e) {
    let isOpenPush = e.detail.value
    if (isOpenPush) {
      // 开启
      app.push.subscribe()
    } else {
      // 关闭
      app.push.unsubscribe()
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
})