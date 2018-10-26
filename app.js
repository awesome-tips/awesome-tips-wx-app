//
//  app.js
//  AwesomeTips
//
//  Created by KANGZUBIN on 2018/3/21.
//  Copyright © 2018 All rights reserved.
//

const towxml = require('./towxml/main.js')

App({
  // 版本号
  version: '1.3.0',

  // 全局数据
  globalData: {
    token: null,        // 服务端返回的登录态
    openId: null,       // 当前微信用户的唯一标识符
    wxUserInfo: null,   // 当前微信用户的信息
    hasLogined: false,  // 标记是否已登录
    isLoginning: false, // 标记是否正在登录中
    isCheckingSession: false, // 标记是否正在校验登录态
    loginError: false,        // 标记登录失败
    isIPX: false,             // 标记当前设备是否为 iPhone X
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

  // 小集订阅推送管理
  push: require('./utils/push.js'),

  // 登录成功后的回调数组
  loginReadyCallbacks: [],

  // 登录失败的回调
  loginFailCallback: null,

  // 微信用户信息获取成功后的回调
  wxUserInfoReadyCallback: null,

  // 小程序启动入口
  onLaunch: function (options) {
    console.log('App On Launch With Options:', options)

    // MTA 统计初始化
    this.initMTA(options)

    // 判断设备是否为 iPhone X
    this.checkIsIPhoneX()

    // 校验用户登录态
    this.checkUserLoginState()
  },

  // 小程序显示
  onShow: function (options) {
    console.log('App On Show With Options:', options)
  },

  // 小程序隐藏
  onHide: function () {
    console.log('App On Hide')
    this.push.uploadFormIds()
  },

  // MTA 统计初始化
  initMTA: function (options) {
    this.mta.App.init({
      "appID": "500604211",
      "eventID": "500604331",
      "lauchOpts": options,
      "statPullDownFresh": true,
      "statReachBottom": true,
      "statShareApp": true
    })
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
  checkUserLoginState: function () {
    const self = this
    if (self.globalData.hasLogined) {
      // 如果已登录，直接返回
      return;
    }

    if (self.globalData.isCheckingSession) {
      // 如果正在校验中，直接返回，避免重复操作
      return;
    }

    // 标记正在校验中
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
          self.globalData.token = token
          self.globalData.openId = openId
          self.globalData.hasLogined = true
          // 执行所有等待登录的延迟回调
          self.execLoginReadyCallbacks()
          // 获取微信用户信息
          self.getWXUserInfo()
        },
        fail: function () {
          // 服务端 session_key 已经失效，需要重新执行微信登录流程
          self.doWXUserLogin()
        },
        complete: function () {
          self.globalData.isCheckingSession = false;
        }
      })
    } else {
      // 本地没有缓存，执行微信登录流程
      self.doWXUserLogin()
      self.globalData.isCheckingSession = false;
    }
  },

  // 执行微信登录流程
  doWXUserLogin: function () {
    const self = this
    if (self.globalData.isLoginning) {
      // 如果正在登录中，直接返回，避免重复操作
      return;
    }

    // 标记正在登录中
    self.globalData.isLoginning = true;

    // 调微信登录方法获取临时登录凭证
    wx.login({
      success: function (res) {
        // wx.login 执行成功，根据用户登录凭证 res.code 换取 openId 和 token
        self.HTTP.POST({
          url: self.URL.userLoginUrl,
          data: {
            code: res.code
          },
          success: function (res) {
            console.log('微信登录成功:', res)
            const token = res.data.token
            const openId = res.data.openId
            if (token && openId) {
              wx.setStorage({
                key: 'token',
                data: token
              })
              wx.setStorage({
                key: 'openId',
                data: openId
              })
              self.globalData.token = token
              self.globalData.openId = openId
              self.globalData.hasLogined = true
              self.globalData.loginError = false

              // 执行所有等待登录的延迟回调
              self.execLoginReadyCallbacks()
              // 获取微信用户信息
              self.getWXUserInfo()
            } else {
              // 登录接口返回数据错误
              console.log('登录接口返回数据错误:', res)
              self.globalData.loginError = true
              self.execLoginFailCallback()
            }
          },
          fail: function (err) {
            // 标记登录失败，并执行失败回调
            console.log('微信登录失败:', err)
            self.globalData.loginError = true
            self.execLoginFailCallback()
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
        self.globalData.loginError = true
        self.execLoginFailCallback()
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
              self.updateWXUserInfo(res.userInfo)
            }
          })
        // }
      // }
    // })
  },

  // 更新当前用户的微信信息
  updateWXUserInfo: function (wxUserInfo) {
    const self = this
    if (wxUserInfo) {
      self.globalData.wxUserInfo = wxUserInfo

      // 执行获取微信用户信息的延迟回调
      if (self.wxUserInfoReadyCallback) {
        self.wxUserInfoReadyCallback(wxUserInfo)
        self.wxUserInfoReadyCallback = null
      }

      if (!self.globalData.hasLogined) {
        // 如果未登录（没有登录态 token），直接返回
        return
      }

      // 调接口更新用户头像、昵称、性别
      self.HTTP.POST({
        url: self.URL.userUpdateUrl,
        data: {
          name: wxUserInfo.nickName,
          avatar: wxUserInfo.avatarUrl,
          gender: wxUserInfo.gender,
        },
        success: function (res) {
          console.log('用户信息更新成功')
        },
        fail: function (err) {
          console.log('用户信息更新失败:', err)
        }
      })
    }
  },

  reLoginThenCallback: function (callback) {
    console.log('登录态失效，重新登录')
    this.globalData.token = null
    this.globalData.hasLogined = false
    // this.loginReadyCallbacks = []
    this.addLoginReadyCallback(callback)
    this.doWXUserLogin()
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
  },

  execLoginFailCallback: function () {
    if (this.loginFailCallback) {
      this.loginFailCallback()
    }
  }

})