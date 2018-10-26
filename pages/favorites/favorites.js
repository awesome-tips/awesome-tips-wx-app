// pages/favorites/favorites.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    canLoadMore: true,
    showBottomLoading: false,
    feedPage: 1,
    feedList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('Favorites Page OnLoad')
    app.mta.Page.init()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    console.log('Favorites Page OnReady')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    console.log('Favorites Page OnShow')
    // 重新加载第一页数据
    wx.showNavigationBarLoading()
    this.data.canLoadMore = true
    this.data.feedPage = 1
    this.getFeedFavorList()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log('Favorites Page OnHide')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log('Favorites Page OnUnload')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    const self = this
    if (self.data.loading) {
      // 正在加载中，直接返回
      return
    }
    setTimeout(function () {
      self.data.canLoadMore = true
      self.data.feedPage = 1
      self.getFeedFavorList()
    }, 1000)
  },

  /**
   * 页面上拉触底事件的处理函数
   */
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
      self.getFeedFavorList()
    }, 1000)
  },

  getFeedFavorList: function () {
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
    app.HTTP.GET({
      url: app.URL.feedFavorListUrl,
      data: {
        page: self.data.feedPage,
        filter: 'tips',
      },
      success: function (result) {
        console.log('Feed favor list request success', result)
        const feeds = result.data.feeds
        if (feeds && feeds.length > 0) { // 如果有返回数据
          const newFeedPage = self.data.feedPage + 1
          let newFeedList = []
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
          if (self.data.feedPage == 1) {
            self.setData({
              feedList: []
            })
          }
          self.data.canLoadMore = false
          wx.showToast({
            icon: 'none',
            title: '总共收藏了 ' + self.data.feedList.length + ' 条小集'
          })
        }
      },
      fail: function (errMsg) {
        console.log('Feed favor list request fail', errMsg)
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
  
})