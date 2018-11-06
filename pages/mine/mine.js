// pages/mine/mine.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: null,
    wxUserInfo: null,
    appVersion: app.version
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()

    if (app.globalData.wxUserInfo) {
      this.setData({
        wxUserInfo: app.globalData.wxUserInfo
      })
    } else {
      // 由于 getUserInfo 是网络请求，可能会在当前页面的 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.wxUserInfoReadyCallback = res => {
        this.setData({
          wxUserInfo: res
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
    dataList.push({ id: 2, title: "订阅管理", clickEnvet: "subscribeBtnClick" })
    dataList.push({ id: 3, title: "关于我们", clickEnvet: "aboutBtnClick" })
    this.setData({
      dataList: dataList,
    })
  },

  // 点击关联获取微信用户信息
  getWXUserInfo: function (e) {
    const wxUserInfo = e.detail.userInfo
    if (wxUserInfo) {
      if (app.globalData.hasLogined) {
        // 已登录
        app.updateWXUserInfo(wxUserInfo)
      } else {
        // 未登录
        app.addLoginReadyCallback(function () {
          // 请求列表数据
          app.updateWXUserInfo(wxUserInfo)
        })
        if (app.globalData.loginError) {
          // 登录失败，重新登录
          app.doWXUserLogin()
        }
      }
    } else {
      console.log(e.detail.errMsg)
      wx.showToast({
        icon: 'none',
        title: '获取微信用户信息失败，请稍后重试',
      })
    }
  },

  // 点击我的收藏
  favorBtnClick: function (event) {
    if (!app.globalData.hasLogined) {
      return
    }
    wx.navigateTo({
      url: '/pages/favorites/favorites'
    })
  },

  // 点击我的订阅
  subscribeBtnClick: function (event) {
    if (!app.globalData.hasLogined) {
      return
    }
    wx.navigateTo({
      url: '/pages/subscribe/subscribe'
    })
  },

  // 点击关于我们
  aboutBtnClick: function (event) {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

})