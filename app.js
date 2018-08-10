//
//  app.js
//  AwesomeTips
//
//  Created by KANGZUBIN on 2018/3/21.
//  Copyright © 2018 All rights reserved.
//

const towxml = require('./towxml/main.js')

App({
  // 全局数据
  globalData: {
    openId: null,
    userInfo: null,
    hasLogined: false,
    isLoginning: false,
    isCheckingSession: false,
    isIPX: false, // 当前设备是否为 iPhone X
  },

  // HTTP 接口地址
  URL: require('./utils/config.js'),

  // HTTP 网络请求
  HTTP: require('./utils/http.js'),

  // MTA 埋点统计
  mta: require('./utils/mta.js'),

  // Markdown 渲染引擎
  render: new towxml(),

  // 工具方法集合
  util: require('./utils/util.js'),

  // 登录成功后的回调数组
  loginReadyCallbacks: [],

  // 微信用户信息获取成功后的回调（我的页面用到）
  userInfoReadyCallback: null,

  // 小程序启动入口
  onLaunch: function (options) {
    console.log('App On Launch With Options:', options)

    // MTA 统计初始化
    this.mta.App.init({
      "appID": "500604211",
      "eventID": "500604331",
      "lauchOpts": options,
      "statPullDownFresh": true,
      "statReachBottom": true,
      "statShareApp": true
    })

    // 判断设备是否为 iPhone X
    this.checkIsIPhoneX()

    // 校验用户登录态
    this.checkUserLogin()
  },

  // 小程序显示
  onShow: function (options) {
    console.log('App On Show With Options:', options)
  },

  // 小程序隐藏
  onHide: function () {
    console.log('App On Hide')
  },

  // 判断设备是否为 iPhone X
  checkIsIPhoneX: function() {
    const self = this
    try {
      const res = wx.getSystemInfoSync()
      if (res.model.search('iPhone X') != -1) {
        self.globalData.isIPX = true
      }
    } catch (e) {
      // catch error
    }
  },

  // 校验用户登录态
  checkUserLogin: function () {
    const self = this
    if (self.globalData.hasLogined) {
      return;
    }

    if (self.globalData.isCheckingSession) {
      return;
    }

    self.globalData.isCheckingSession = true;

    // 先取本地缓存（同步）
    const token = wx.getStorageSync('token')
    const openId = wx.getStorageSync('openId')
    if (token && openId) {
      // 如果已登录，检查 session_key 是否过期
      wx.checkSession({
        success: function () {
          // 服务端 session_key 未过期，并且在本生命周期一直有效
          self.HTTP.token = token
          self.globalData.openId = openId
          self.globalData.hasLogined = true
          // 执行所有等待登录的延迟回调
          self.execLoginReadyCallbacks()
          // 获取微信用户信息
          self.getWXUserInfo()
        },
        fail: function () {
          // 服务端 session_key 已经失效，需要重新执行登录流程
          self.doUserLogin()
        },
        complete: function () {
          self.globalData.isCheckingSession = false;
        }
      })
    } else {
      // 本地没有缓存，执行登录流程
      self.doUserLogin()
      self.globalData.isCheckingSession = false;
    }
  },

  // 执行登录流程
  doUserLogin: function () {
    const self = this
    if (self.globalData.isLoginning) {
      return;
    }

    self.globalData.isLoginning = true;

    // 微信登录方法
    wx.login({
      success: function (res) {
        // wx.login 执行成功，根据用户登录凭证 res.code 换取 openId 和 token
        self.HTTP.POST({
          url: self.URL.userLoginUrl,
          data: {
            code: res.code
          },
          success: function (res) {
            if (res.data.code == 0) {
              console.log('微信登录成功:', res)
              const token = res.data.data.token
              const openId = res.data.data.openId
              if (token && openId) {
                wx.setStorage({
                  key: 'token',
                  data: token
                })
                wx.setStorage({
                  key: 'openId',
                  data: openId
                })
                self.HTTP.token = token
                self.globalData.openId = openId
                self.globalData.hasLogined = true

                // 执行所有等待登录的延迟回调
                self.execLoginReadyCallbacks()
                // 获取微信用户信息
                self.getWXUserInfo()
              }
            } else {
              console.log('微信登录失败:', res)
            }
          },
          fail: function (err) {
            console.log('微信登录失败:', err)
          },
          complete: function (res) {
            self.globalData.isLoginning = false;
          }
        })
      },
      fail: function (err) {
        // wx.login 执行失败
        console.log('wx.login 执行失败:', err)
        self.globalData.isLoginning = false;
      }
    })
  },

  // 获取微信用户信息
  getWXUserInfo: function () {
    const self = this

    // NOTE: 过渡期，这里暂时直接调 wx.getUserInfo 获取用户信息（开发版和体验版不起效），以便用户一进入就直接弹窗获取用户信息
    
    // 判断用户是否授权过获取用户信息
    // wx.getSetting({
    //   success: function (res) {
    //     if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: function (res) {
              self.updateUserInfo(res.userInfo)
            }
          })
    //     }
    //   },
    //   fail: function (err) {
    //     console.log(err)
    //   }
    // })
  },

  // 更新当前用户信息
  updateUserInfo: function (userInfo) {
    const self = this
    if (userInfo) {
      self.globalData.userInfo = userInfo
      // 执行获取用户信息的延迟回调（只有我的页面用到）
      if (self.userInfoReadyCallback) {
        self.userInfoReadyCallback(userInfo)
        self.userInfoReadyCallback = null
      }
      if (!self.globalData.hasLogined) {
        // 如果未登录（没有登录态 token），直接返回
        return
      }
      // 调接口更新用户头像、昵称、性别
      self.HTTP.POST({
        url: self.URL.userUpdateUrl,
        data: {
          name: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          gender: userInfo.gender,
        },
        success: function (res) {
          if (res.data.code == 0) {
            console.log('用户信息更新成功')
          } else if (res.data.code == -1) {
            console.log('用户信息更新时登录失效:', res)
            // 登录失效，重新执行登录流程
            self.reLoginThenCallback()
          } else {
            console.log('用户信息更新失败:', res)
          }
        },
        fail: function (err) {
          console.log('用户信息更新接口调用失败', res)
        }
      })
    }
  },

  reLoginThenCallback: function (callback) {
    console.log('登录失效，重新登录')
    this.HTTP.token = null
    this.globalData.hasLogined = false
    this.loginReadyCallbacks = []
    this.addLoginReadyCallback(callback)
    this.doUserLogin()
  },

  addLoginReadyCallback: function (callback) {
    if (!callback) return
    if (this.globalData.hasLogined) {
      // 已登录，直接执行
      callback()
    } else {
      this.loginReadyCallbacks.push(callback)
    }
  },

  execLoginReadyCallbacks: function () {
    this.loginReadyCallbacks.forEach((item) => {
      item();
    });
    this.loginReadyCallbacks = []
  }

})