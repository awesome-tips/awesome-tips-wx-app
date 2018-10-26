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
  },

  // 页面初始化
  onLoad: function (options) {
    const self = this

    app.mta.Page.init()
    wx.showNavigationBarLoading()

    if (app.globalData.hasLogined) {
      // 已登录
      self.getFeedList()
    } else {
      // 未登录延迟加载
      app.addLoginReadyCallback(function () {
        self.getFeedList()
      })
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    const self = this
    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }
    // 这里延迟 1 秒再发起请求，避免下拉动画一闪而过
    setTimeout(function () {
      self.data.feedPage = 1
      self.data.canLoadMore = true
      self.getFeedList()
    }, 1000)
  },

  // 底部加载
  onReachBottom: function () {
    const self = this
    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }
    if (!self.data.canLoadMore) {
      // 不能加载更多，直接返回
      return
    }
    // 显示底部加载动画
    self.setData({
      showBottomLoading: true
    })
    // 同样的，这里延迟 1 秒再发起请求，避免底部动画一闪而过
    setTimeout(function () {
      self.getFeedList()
    }, 1000)
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

    // 发起请求
    app.HTTP.GET({
      url: app.URL.feedListUrl,
      data: {
        page: self.data.feedPage,
        filter: 'tips',
      },
      success: function (result) {
        console.log('Feed list request success', result)
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
        console.log('Feed list request fail', errMsg)
      },
      complete: function () {
        // 标记加载结束
        self.data.loading = false
        self.closeLoadingView()
      }
    })
  },

  // 关闭相关 Loading 视图
  closeLoadingView: function () {
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
    if (this.data.showBottomLoading) {
      this.setData({
        showBottomLoading: false
      })
    }
  },

  // 列表项点击
  feedItemClick: function (event) {
    const feed = event.currentTarget.dataset.feed
    if (feed && feed.fid) {
      wx.navigateTo({
        url: '../detail/detail?fid=' + feed.fid
      })
    }
  },

  // 搜索按钮点击
  searchBtnClick: function (event) {
    wx.navigateTo({
      url: '../search/search'
    })
  },

  // 转发
  onShareAppMessage: function (res) {
    return {
      title: '专注于 iOS 知识分享',
      path: 'pages/index/index?from=share',
      imageUrl: 'https://tips.kangzubin.com/share.jpg'
    }
  },

  subscribeSubmit: function (event) {
    const formId = event.detail.formId
    if (formId) {
      console.log(formId)
      app.push.subscribe(formId)
    }
  }

})