// search.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    keyword: null,
    loading: false,
    feedList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()
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

  gotoSearch: function (e) {
    const keyword = e.detail.value.trim()
    if (keyword.length > 0) {
      if (keyword == this.data.keyword) {
        // 如果两次关键词一致，则忽略
        return
      }
      this.setData({
        keyword: keyword
      })
      this.searchFeedList()
    } else {
      this.setData({
        // 清空原有数据
        keyword: null,
        feedList: []
      })
    }
  },

  searchFeedList: function () {
    const self = this

    if (self.data.loading) {
      // 正在搜索中，直接返回
      return
    }

    if (self.data.keyword == null || self.data.keyword.length == 0) {
      return
    }

    this.setData({
      // 清空原有数据
      feedList: []
    })

    wx.showLoading({
      icon: 'loading'
    })

    // 标记正在加载中
    self.data.loading = true

    app.HTTP.GET({
      url: app.URL.feedSearchUrl,
      data: {
        key: self.data.keyword,
        filter: 'tips',
      },
      success: function (result) {
        console.log('Search request success', result)
        const feeds = result.data.feeds
        if (feeds && feeds.length > 0) { // 如果有返回数据
          self.setData({
            feedList: feeds,
          })
        }
      },
      fail: function (errMsg) {
        console.log('Search request fail', errMsg)
      },
      complete: function () {
        // 标记搜索结束
        self.data.loading = false
        wx.hideLoading()
        if (self.data.feedList.length > 0) {
          wx.showToast({
            icon: 'none',
            title: '总共搜索到 ' + self.data.feedList.length + ' 条小集'
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '搜索结果为空'
          })
        }
      }
    })
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