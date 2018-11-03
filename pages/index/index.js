// pages/index/index.js

const app = getApp()

Page({
  // 页面数据
  data: {
    loading: false, // 是否正在加载中
    canLoadMore: true, // 是否能加载更多
    showBottomLoading: false, // 是否显示底部加载视图
    feedPage: 1,  // 列表页数
    feedList: [], // 列表数据
    loginError: false, // 标识登录失败，显示重试按钮
  },

  // 页面初始化
  onLoad: function (options) {
    const self = this

    app.mta.Page.init()

    if (app.globalData.hasLogined) {
      // 已登录，请求列表数据
      wx.showLoading({
        mask: true
      })
      self.getFeedList()
    } else {
      if (app.globalData.loginError) {
        // 登录已失败，显示错误页面
        self.showLoginErrorPage()
      } else {
        // 正在登录中
        wx.showLoading({
          mask: true
        })
      }
      // 设置登录成功回调
      app.addLoginReadyCallback(function () {
        // 请求列表数据
        self.getFeedList()
      })
      // 设置登录失败回调
      app.loginFailCallback = function () {
        wx.hideLoading()
        self.showLoginErrorPage()
      }
    }
  },

  // 显示登录错误页面
  showLoginErrorPage: function () {
    this.setData({
      loginError: true
    })
    wx.showToast({
      icon: 'none',
      title: '登录失败，请稍后重试',
    })
  },

  // 登录按钮重试
  reLoginButtonClick: function () {
    this.setData({
      loginError: false
    })
    wx.showLoading({
      mask: true,
    })
    app.doWXUserLogin()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    if (this.data.loginError) {
      // 登录失败
      wx.stopPullDownRefresh()
      return
    }

    if (this.data.loading) {
      // 正在加载中，直接返回
      return
    }

    // 加载首页数据
    this.data.feedPage = 1
    this.data.canLoadMore = true
    this.getFeedList()
  },

  // 底部加载
  onReachBottom: function () {
    if (this.data.loginError) {
      // 登录失败
      return
    }

    if (this.data.loading || !this.data.canLoadMore || this.data.feedList.length == 0) {
      // 正在加载中，或不能加载更多，或者列表数据为空，则直接返回
      return
    }

    // 显示底部加载动画
    this.setData({
      showBottomLoading: true
    })

    // 请求下一页数据
    this.getFeedList()
  },

  getFeedList: function () {
    const self = this

    if (!app.globalData.hasLogined) {
      // 未登录，直接返回
      return
    }

    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }

    if (!self.data.canLoadMore) {
      // 不能加载更多，直接返回
      self.closeLoadingView()
      return
    }

    // 标记正在加载中
    self.data.loading = true

    // 延迟 1 秒发起请求，避免加载动画一闪而过
    setTimeout(function () {
      app.HTTP.GET({
        url: app.URL.feedListUrl,
        data: {
          page: self.data.feedPage,
          filter: 'tips',
        },
        success: function (result) {
          console.log('Feed list request success:', result)
          wx.hideLoading()
          let feeds = result.data.feeds
          if (feeds && feeds.length > 0) { // 如果有返回数据
            let newFeedList = []
            if (self.data.feedPage == 1) {
              // feeds.splice(2, 0, {fid:-1}) // 第一页的第 3 条数据插入广告
            } else {
              newFeedList = newFeedList.concat(self.data.feedList)
            }
            newFeedList = newFeedList.concat(feeds)
            // newFeedList.push({fid:-1}) // 每一页末尾插入一条广告
            const newFeedPage = self.data.feedPage + 1
            self.setData({
              feedPage: newFeedPage,
              feedList: newFeedList
            })
          } else {
            // 标记不能加载更多了
            self.data.canLoadMore = false
            wx.showToast({
              icon: 'none',
              title: '总共有 ' + self.data.feedList.length + ' 条小集，没有更多了'
            })
          }
        },
        fail: function (errMsg) {
          console.log('Feed list request fail:', errMsg)
          wx.hideLoading()
          wx.showToast({
            icon: 'none',
            title: '获取失败，请稍后下拉重试',
          })
        },
        complete: function () {
          // 标记加载结束
          self.data.loading = false
          self.closeLoadingView()
        }
      })
    }, 1000)
  },

  // 关闭下拉刷新或者底部加载 Loading 视图
  closeLoadingView: function () {
    wx.stopPullDownRefresh()
    if (this.data.showBottomLoading) {
      this.setData({
        showBottomLoading: false
      })
    }
  },

  // 点击订阅小集
  subscribeSubmit: function (event) {
    const formId = event.detail.formId
    if (formId) {
      app.push.subscribe(formId)
    }
  },

  // 右上角转发
  onShareAppMessage: function (res) {
    return {
      title: '专注于 iOS 知识分享',
      path: '/pages/index/index?from=share',
      imageUrl: 'https://tips.kangzubin.com/share.jpg'
    }
  },

})