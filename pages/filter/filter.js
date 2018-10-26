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
    
    // 加载首页第一页数据
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
    app.HTTP.GET({
      url: app.URL.feedListUrl,
      data: {
        page: self.data.feedPage,
        filter: self.data.filter,
      },
      success: function (result) {
        console.log('Filter list request success', result)
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
        console.log('Filter list request fail', errMsg)
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
    if (feed.platform == 0) {
      // 微博小集
      if (feed.fid.length > 0) {
        wx.navigateTo({
          url: '../detail/detail?fid=' + feed.fid
        })
      }
    } else if (feed.platform == 1) {
      // 公众号文章
      if (feed.url.length > 0) {
        this.showAlert('我们的小程序暂时无法加载公众号文章，请复制链接后在浏览器中打开查看哦。你也可以关注我们的“知识小集”公众号获取更多文章。', feed.url)
      }
    } else if (feed.platform == 3) {
      // Medium 链接
      if (feed.url.length > 0) {
        this.showAlert('知识小集的英文版由 @故胤道长 维护并定期发布在 Medium 平台上。由于小程序暂时无法加载外链，请复制链接后在浏览器中打开查看，需要自行翻墙才能访问哦。', feed.url)
      }
    }
  },

  showAlert: function (content, url) {
    wx.showModal({
      content: content,
      cancelText: '关闭',
      confirmText: '复制链接',
      success: function (res) {
        if (res.confirm) {
          // 点击了确定按钮
          wx.setClipboardData({
            data: url,
            success: function (res) {
              wx.showToast({
                icon: 'success',
                title: '链接已复制'
              })
            }
          })
        }
      }
    })
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
      self.getFeedList()
    }, 1000)
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