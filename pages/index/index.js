// index.js

// 获取应用实例
const app = getApp()
const mta = require('../../utils/mta_analysis.js')
const feedListUrl = require('../../config').feedListUrl

Page({
  // 页面数据
  data: {
    tipsText: '每天更新，专注于 iOS 知识分享',
    loading: false,
    canLoadMore: true,
    feedPage: 1,    
    feedList: []
  },

  // 页面初始化后
  onLoad: function () {
    console.log('Index Page On Load')
    mta.Page.init()
    wx.showNavigationBarLoading()
    this.data.feedPage = 1
    this.getFeedList()
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    var self = this
    wx.showNavigationBarLoading()
    setTimeout(function () {
      self.data.canLoadMore = true
      self.data.feedPage = 1
      self.getFeedList()
    }, 500);
  },

  // 底部加载
  onReachBottom: function () {
    var self = this
    if (!self.data.canLoadMore) {
      // 不能加载更多，直接返回
      return;
    }
    wx.showNavigationBarLoading()
    setTimeout(function () {
      self.getFeedList()
    }, 500);
  },

  getFeedList: function () {
    var self = this

    if (self.data.loading) {
      // 正在加载中，直接返回
      return;
    }

    if (!self.data.canLoadMore) {
      // 不能加载更多，直接返回
      self.closeLoadingView()
      return;
    }

    // 标记正在加载中
    self.data.loading = true

    wx.request({
      url: feedListUrl,
      method: 'GET',
      dataType: 'json',
      data: {
        page: self.data.feedPage,
      },
      header: {
        'from': app.globalData.appFrom,
        'version': app.globalData.appVersion,
      },
      success: function (result) {
        console.log('Feed list request success', result)
        if (result.data.code == 0) { // 接口请求成功
          var feeds = result.data.data.feeds
          if (feeds && feeds.length > 0) { // 如果有返回数据
            var newFeedPage = self.data.feedPage + 1;
            var newFeedList = []
            if (self.data.feedPage > 1) {
              newFeedList = newFeedList.concat(self.data.feedList)
            }
            newFeedList = newFeedList.concat(feeds)
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

  closeLoadingView: function () {
    wx.hideNavigationBarLoading()
    wx.stopPullDownRefresh()
  },

  // 列表项点击
  feedItemClick: function (event) {
    var feed = event.currentTarget.dataset.feed
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
    var self = this
    return {
      title: '专注于 iOS 知识分享',
      path: 'pages/index/index',
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },

})
