// pages/filter/filter.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: null,
    filter: null,
    loading: false,
    canLoadMore: true,
    showBottomLoading: false,
    isIPX: app.globalData.isIPX,
    feedPage: 1,
    feedList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()

    let filter = options.filter
    if (!filter) {
      filter = 'tips'
    }
    let title = options.title
    if (!title) {
      title = '知识小集'
    }

    this.data.filter = filter
    this.data.title = title
    wx.setNavigationBarTitle({
      title: title,
    })
    
    // 加载第一页数据
    wx.showNavigationBarLoading()
    this.data.feedPage = 1
    this.getFeedList()
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
    setTimeout(function () {
      app.HTTP.GET({
        url: app.URL.feedListUrl,
        data: {
          page: self.data.feedPage,
          filter: self.data.filter,
        },
        success: function (result) {
          console.log('Filter list request success:', result)
          let feeds = result.data.feeds
          if (feeds && feeds.length > 0) {
            let newFeedList = []
            if (self.data.feedPage == 1) {

            } else {
              newFeedList = newFeedList.concat(self.data.feedList)
            }
            newFeedList = newFeedList.concat(feeds)
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
              title: '没有更多了'
            })
          }
        },
        fail: function (errMsg) {
          console.log('Filter list request fail:', errMsg)
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.loading) {
      // 正在加载中，直接返回
      return
    }
    // 获取第一页数据
    this.data.feedPage = 1
    this.data.canLoadMore = true
    this.getFeedList()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.title,
      path: 'pages/filter/filter?from=share&title=' + this.data.title + '&filter=' + this.data.filter,
      imageUrl: 'https://tips.kangzubin.com/share.jpg'
    }
  }
})