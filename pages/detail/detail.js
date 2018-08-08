// detail.js

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
    favorTitle: '收藏',
    isIPX: app.globalData.isIPX,
    article: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()

    const fid = options.fid
    if (fid) {
      this.setData({
        fid: fid
      })

      wx.showLoading({
        icon: 'loading'
      })

      // 调接口加载小集详情
      if (app.globalData.hasLogined) {
        // 已登录
        this.getFeedDetail()
      } else {
        // 未登录延迟加载
        const self = this
        app.addLoginReadyCallback(function(){
          self.getFeedDetail()
        })
      }
    } else {
      this.feedNotFoundError()
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
        console.log('Feed detail request success', result)
        if (result.data.code == 0) { // 接口请求成功
          const feed = result.data.data.feed
          if (feed) {
            self.setData({
              feed: feed
            })
            self.feedConetntRendering()
            return
          }
        }
        self.feedNotFoundError()
        wx.hideLoading()
      },
      fail: function (errMsg) {
        console.log('Feed detail request fail', errMsg)
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
    const self = this
    const feed = self.data.feed
    if (!feed) {
      wx.hideLoading()
      return
    }

    if (feed.favor == 1) {
      self.setData({
        favorTitle: '取消收藏'
      })
    }

    let contentType = 'markdown'
    if (feed.type == 1) {
      contentType = 'html'
    }
    let content = feed.content
    if (!content || content.length == 0) {
      content = '暂时无法加载该小集详情，请复制原文链接后在浏览器中打开查看。'
    }
    content = content + '\r\n\r\n[原文链接](' + feed.url + ')'
    
    let articleData = app.render.toJson(content, contentType)
    self.setData({
      article: articleData,
      pageHide: false
    })
    wx.hideLoading()
  },

  // 小集不存在
  feedNotFoundError: function () {
    const tipsTitle = '该小集不存在'
    wx.setNavigationBarTitle({
      title: tipsTitle
    })
    wx.showToast({
      icon: 'none',
      title: tipsTitle
    })
    // 隐藏分享按钮
    wx.hideShareMenu()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    const self = this
    if (self.data.feed) {
      const title = self.data.feed.title
      const path = 'pages/index/index?from=share&fid=' + self.data.feed.fid
      return {
        title: title,
        path: path,
        imageUrl: 'https://tips.kangzubin.com/share.jpg'
      }
    } else {
      return null
    }
  },

  // 收藏按钮点击
  favorButtonClick: function () {
    const self = this
    if (!app.globalData.hasLogined) {
      app.reLoginThenCallback(function(){
        self.favorButtonClick()
      })
      return;
    }

    if (self.data.loading) {
      return
    }

    // 标记正在加载中
    self.data.loading = true

    const favorValue = self.data.feed.favor == 0 ? 1 : 0
    app.HTTP.GET({
      url: app.URL.feedFavorlUrl,
      data: {
        fid: self.data.fid,
        favor: favorValue,
      },
      success: function (result) {
        console.log('Feed favor request success', result)
        wx.hideLoading()
        if (result.data.code == 0) {
          wx.showToast({
            icon: 'success',
            title: favorValue == 0 ? '取消收藏成功' : '收藏成功'
          })
          const favorTitleValue = favorValue == 0 ? '收藏' : '取消收藏'
          self.data.feed.favor = favorValue
          self.setData({
            favorTitle: favorTitleValue
          })
        } else if (result.data.code == -1) {
          // 登录失效，重新登录
          app.reLoginThenCallback(function () {
            self.favorButtonClick()
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '收藏失败，请稍后重试'
          })
        }
      },
      fail: function (errMsg) {
        console.log('Feed favor request fail', errMsg)
        wx.showToast({
          icon: 'none',
          title: errMsg
        })
      },
      complete: function () {
        // 标记加载结束
        self.data.loading = false
      }
    })
  },

  // 文中链接点击
  onUrlLinkTap: app.util.onUrlLinkTap,

  // 文中图片点击，浏览大图
  onImageTap: app.util.onImageTap,

})