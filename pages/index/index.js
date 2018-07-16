// pages/index/index.js

const app = getApp()
const mta = require('../../utils/mta_analysis.js')
const feedListUrl = require('../../config.js').feedListUrl

Page({
  // 页面数据
  data: {
    tipsText: '每天更新，专注于 iOS 知识分享',
    loading: false,
    canLoadMore: true,
    showBottomLoading: false,
    feedPage: 1,
    feedList: []
  },

  // 页面初始化
  onLoad: function (options) {
    console.log('Index Page On Load With Options:', options)
    mta.Page.init()

    // 加载首页第一页数据
    wx.showNavigationBarLoading()
    this.data.feedPage = 1
    this.getFeedList()

    // 从分享的群消息点进来，跳转到详情页
    if (options.from && options.from == 'share') {
      if (options.fid) {
        wx.hideNavigationBarLoading()
        wx.navigateTo({
          url: '../detail/detail?fid=' + options.fid
        })
      }
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    const self = this
    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }
    setTimeout(function () {
      self.data.canLoadMore = true
      self.data.feedPage = 1
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
    self.setData({
      showBottomLoading: true
    })
    setTimeout(function () {
      self.getFeedList()
    }, 1000)
  },

  getFeedList: function () {
    const self = this

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
    wx.request({
      url: feedListUrl,
      method: 'GET',
      dataType: 'json',
      data: {
        page: self.data.feedPage,
        filter: 'tips',
      },
      header: {
        'from': app.globalData.appFrom,
        'version': app.globalData.appVersion,
      },
      success: function (result) {
        console.log('Feed list request success', result)
        if (result.data.code == 0) { // 接口请求成功
          let feeds = result.data.data.feeds
          if (feeds && feeds.length > 0) { // 如果有返回数据
            let newFeedList = []
            if (self.data.feedPage == 1) {
              feeds.splice(2, 0, {fid:-1}) // 第一页的第 3 条数据插入广告
            } else {
              newFeedList = newFeedList.concat(self.data.feedList)
            }
            newFeedList = newFeedList.concat(feeds)
            newFeedList.push({fid:-1}) // 每一页末尾插入一条广告
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
    const self = this
    if (self.data.showBottomLoading) {
      self.setData({
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

})