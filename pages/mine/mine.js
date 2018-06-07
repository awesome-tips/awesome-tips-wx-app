// pages/mine/mine.js

const app = getApp()
const mta = require('../../utils/mta_analysis.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
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

  // 点击登录获取微信用户信息
  getUserInfo: function (e) {
    var userInfo = e.detail.userInfo
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

  // 点击关于我们
  aboutBtnClick: function (event) {
    wx.navigateTo({
      url: '../about/about'
    })
  },

})