// pages/about/about.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fid: null,
    feed: null,
    loading: false,
    pageHide: true,
    isIPX: app.globalData.isIPX,
    article: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()

    let str = null
    let tp = options.type
    if (tp && tp == 'more') {
      str = '更多小集'
      this.data.fid = 269
    } else {
      str = '关于我们'
      this.data.fid = 148
    }
    wx.setNavigationBarTitle({
      title: str,
    })

    wx.showLoading()

    // 调接口加载小集详情（关于我们、更多小集）
    if (app.globalData.hasLogined) {
      // 已登录
      this.getFeedDetail()
    } else {
      // 未登录延迟加载
      const self = this
      app.addLoginReadyCallback(function () {
        self.getFeedDetail()
      })
    }
  },

  // 获取小集详情
  getFeedDetail: function () {
    const self = this

    if (self.data.fid == null) {
      return
    }

    if (self.data.loading) {
      return
    }

    // 标记正在加载中
    self.data.loading = true

    app.HTTP.GET({
      url: app.URL.feedDetailUrl,
      data: {
        fid: self.data.fid,
      },
      success: function (result) {
        console.log('About Content request success:', result)
        const feed = result.data.feed
        if (feed) {
          self.data.feed = feed
          self.feedConetntRendering()
        } else {
          wx.hideLoading()
        }
      },
      fail: function (errMsg) {
        console.log('About Content request fail:', errMsg)
        wx.showToast({
          icon: 'none',
          title: '加载失败，请稍后重试',
        })
        wx.hideLoading()
      },
      complete: function () {
        // 标记加载结束
        self.data.loading = false
      }
    })
  },

  // 渲染 Markdown 内容
  feedConetntRendering: function () {
    const feed = this.data.feed
    if (!feed) {
      wx.hideLoading()
      return
    }

    let contentType = 'markdown'
    if (feed.type == 1) {
      contentType = 'html'
    }
    let content = feed.content
    if (!content || content.length == 0) {
      wx.hideLoading()
      return
    }

    let articleData = app.render.toJson(content, contentType)
    this.setData({
      article: articleData,
      pageHide: false
    })
    wx.hideLoading()
  },

  // 复制文中链接
  onUrlLinkTap: app.util.onUrlLinkTap,

  // 打开图片浏览
  onImageTap: app.util.onImageTap,

})