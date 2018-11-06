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
    isIPX: app.globalData.isIPX,
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
    this.data.feedPage = 1
    this.data.canLoadMore = true
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
    if (this.data.loading) {
      // 正在加载中，直接返回
      return
    }
    // 获取第一页数据
    this.data.feedPage = 1
    this.data.canLoadMore = true
    this.getFeedFavorList()
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
    this.getFeedFavorList()
  },

  getFeedFavorList: function () {
    const self = this

    if (!app.globalData.hasLogined) {
      // 未登录，直接返回
      self.closeLoadingView()
      wx.showToast({
        icon: 'none',
        title: '未登录，请稍后重试'
      })
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
        url: app.URL.feedFavorListUrl,
        data: {
          page: self.data.feedPage,
          filter: 'tips',
        },
        success: function (result) {
          console.log('Feed favor list request success:', result)
          const feeds = result.data.feeds
          if (feeds && feeds.length > 0) {
            // 如果有返回数据
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
          console.log('Feed favor list request fail:', errMsg)
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
    if (this.data.showBottomLoading) {
      this.setData({
        showBottomLoading: false
      })
    }
  },
  
})