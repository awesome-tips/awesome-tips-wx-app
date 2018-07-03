// app.js

const towxml = require('./towxml/main.js')
const mta = require('./utils/mta_analysis.js')
const userLoginUrl = require('./config.js').userLoginUrl
const userUpdateUrl = require('./config.js').userUpdateUrl

App({
  // 全局数据
  globalData: {
    appFrom: 'wxapp',
    appVersion: '1.1.0',
    token: null,
    openId: null,
    userInfo: null,
    hasLogined: false,
    isLoginning: false,
    isCheckingSession: false,
  },

  // 登录成功后的回调
  loginReadyCallbacks: [],

  // 微信用户信息获取成功后的回调
  userInfoReadyCallback: null,

  // 渲染引擎
  render: new towxml(),

  // 小程序启动入口
  onLaunch: function (options) {
    console.log('App On Launch With Options:', options)

    // MTA 统计初始化
    mta.App.init({
      "appID": "500604211",
      "eventID": "500604331",
      "lauchOpts": options,
      "statPullDownFresh": true,
      "statReachBottom": true,
      "statShareApp": true
    })

    // 用户登录态校验
    this.checkUserLogin()
  },

  onShow: function () {
    console.log('App On Show')
  },

  onHide: function () {
    console.log('App On Hide')
  },

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
          self.globalData.token = token
          self.globalData.openId = openId
          self.globalData.hasLogined = true
          self.execLoginReadyCallbacks()
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
      self.doUserLogin()
      self.globalData.isCheckingSession = false;
    }
  },

  doUserLogin: function () {
    const self = this
    if (self.globalData.isLoginning) {
      return;
    }

    self.globalData.isLoginning = true;

    // 登录
    wx.login({
      success: function (res) {
        wx.request({
          url: userLoginUrl,
          method: 'POST',
          dataType: 'json',
          data: {
            code: res.code
          },
          header: {
            'from': self.globalData.appFrom,
            'version': self.globalData.appVersion,
            'content-type': 'application/x-www-form-urlencoded',
          },
          success: function (res) {
            if (res.data.code == 0) {
              console.log('登录成功:', res)
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
                self.globalData.token = token
                self.globalData.openId = openId
                self.globalData.hasLogined = true

                // 执行延迟回调
                self.execLoginReadyCallbacks()

                // 登录成功，获取微信用户信息
                self.getWXUserInfo()
              }
            } else {
              console.log('登录失败:', res)
            }
          },
          fail: function (err) {
            console.log('登录失败:', err)
          },
          complete: function () {
            self.globalData.isLoginning = false;
          }
        })
      },
      fail: function (err) {
        self.globalData.isLoginning = false;
      }
    })
  },

  getWXUserInfo: function () {
    const self = this
    // 判断用户是否授权过获取用户信息
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: function (res) {
              self.updateUserInfo(res.userInfo)
            }
          })
        }
      },
      fail: function (err) {
        console.log(err)
      }
    })
  },

  updateUserInfo: function (userInfo) {
    const self = this
    if (userInfo) {
      self.globalData.userInfo = userInfo
      // 执行延迟回调
      if (self.userInfoReadyCallback) {
        self.userInfoReadyCallback(userInfo)
        self.userInfoReadyCallback = null
      }
      if (!self.globalData.hasLogined) {
        return
      }
      // 调接口更新用户头像、昵称、性别
      wx.request({
        url: userUpdateUrl,
        method: 'POST',
        dataType: 'json',
        data: {
          name: userInfo.nickName,
          avatar: userInfo.avatarUrl,
          gender: userInfo.gender,
          token: self.globalData.token,
        },
        header: {
          'from': self.globalData.appFrom,
          'version': self.globalData.appVersion,
          'content-type': 'application/x-www-form-urlencoded',
        },
        success: function (res) {
          if (res.data.code == 0) {
            console.log('用户信息更新成功')
          } else if (res.data.code == -1) {
            console.log('用户信息更新失败', res)
            self.reLoginThenCallback()
          } else {
            console.log('用户信息更新失败', res)
          }
        },
        fail: function (err) {
          console.log(err)
        },
      })
    }
  },

  reLoginThenCallback: function (callback) {
    console.log('重新登录')
    this.globalData.token = null
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