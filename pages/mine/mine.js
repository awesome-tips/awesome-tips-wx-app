// pages/mine/mine.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    dataList: null,
    appVersion: app.HTTP.version
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else {
      // 由于 getUserInfo 是网络请求，可能会在当前页面的 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res,
          hasUserInfo: true
        })
      }
    }
    this.initDataList()
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

  // 初始化页面列表数据源
  initDataList: function () {
    let dataList = []
    dataList.push({ id: 1, title: "我的收藏", clickEnvet: "favorBtnClick" })
    // dataList.push({ id: 2, title: "我的订阅", clickEnvet: "subscribeBtnClick" })
    // dataList.push({ id: 3, title: "意见反馈", clickEnvet: "feedbackBtnClick" })
    dataList.push({ id: 4, title: "关于我们", clickEnvet: "aboutBtnClick" })
    this.setData({
      dataList: dataList,
    })
  },

  // 点击登录获取微信用户信息
  getUserInfo: function (e) {
    const userInfo = e.detail.userInfo
    if (userInfo) {
      app.updateUserInfo(userInfo)
    } else {
      console.log(e.detail.errMsg)
    }
  },

  // 点击我的收藏
  favorBtnClick: function (event) {
    wx.navigateTo({
      url: '../favorites/favorites'
    })
  },

  // 点击我的订阅
  // subscribeBtnClick: function (event) {
  //   wx.navigateTo({
  //     url: '../subscribe/subscribe'
  //   })
  // },

  // 点击意见反馈
  // feedbackBtnClick: function (event) {
  //   wx.navigateTo({
  //     url: '../feedback/feedback'
  //   })
  // },

  // 点击关于我们
  aboutBtnClick: function (event) {
    wx.navigateTo({
      url: '../about/about'
    })
  },

})