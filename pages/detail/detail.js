// detail.js

const app = getApp()
const mta = require('../../utils/mta_analysis.js')
const feedDetailUrl = require('../../config').feedDetailUrl
const feedFavorlUrl = require('../../config').feedFavorlUrl

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
    article: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()

    var fid = options.fid
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
        var self = this
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
    var self = this

    if (self.data.fid == null) {
      return
    }

    if (self.data.loading) {
      return
    }

    // 标记正在加载中
    self.data.loading = true

    wx.request({
      url: feedDetailUrl,
      method: 'GET',
      dataType: 'json',
      data: {
        fid: self.data.fid,
        token: app.globalData.token,
      },
      header: {
        'from': app.globalData.appFrom,
        'version': app.globalData.appVersion,
      },
      success: function (result) {
        console.log('Feed detail request success', result)
        if (result.data.code == 0) { // 接口请求成功
          var feed = result.data.data.feed
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
    var self = this
    var feed = self.data.feed
    if (!feed) {
      wx.hideLoading()
      return
    }

    if (feed.favor == 1) {
      self.setData({
        favorTitle: '取消收藏'
      })
    }

    var contentType = 'markdown'
    if (feed.type == 1) {
      contentType = 'html'
    }
    var content = feed.content
    if (!content || content.length == 0) {
      content = '暂时无法加载该小集详情，请复制原文链接后在浏览器中打开查看：[' + feed.url + '](' + feed.url + ')'
    }
    
    let articleData = app.render.toJson(content, contentType)
    self.setData({
      article: articleData,
      pageHide: false
    })
    wx.hideLoading()
  },

  // 小集不存在
  feedNotFoundError: function () {
    var tipsTitle = '该小集不存在'
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
    var self = this
    if (self.data.feed) {
      var title = self.data.feed.title
      var path = 'pages/index/index?from=share&fid=' + self.data.feed.fid
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
    var self = this
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

    var favorValue = self.data.feed.favor == 0 ? 1 : 0
    wx.request({
      url: feedFavorlUrl,
      method: 'GET',
      dataType: 'json',
      data: {
        fid: self.data.fid,
        favor: favorValue,
        token: app.globalData.token,
      },
      header: {
        'from': app.globalData.appFrom,
        'version': app.globalData.appVersion,
      },
      success: function (result) {
        console.log('Feed favor request success', result)
        wx.hideLoading()
        if (result.data.code == 0) {
          wx.showToast({
            icon: 'success',
            title: favorValue == 0 ? '取消收藏成功' : '收藏成功'
          })
          var favorTitleValue = favorValue == 0 ? '收藏' : '取消收藏'
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

  // 复制原文链接（暂时去掉）
  copyLinkButtonClick: function () {
    if (this.data.feed) {
      this.setUrlToClipboard(this.data.feed.url)
    }
  },

  // 复制文中链接
  onUrlLinkTap: function (sender) {
    var url = sender.currentTarget.dataset.url
    this.setUrlToClipboard(url)
  },

  // 打开图片浏览
  onImageTap: function (sender) {
    var url = sender.currentTarget.dataset.src
    if (url && url.length > 0) {
      wx.previewImage({
        current: url,
        urls: [url]
      })
    }
  },

  setUrlToClipboard: function (url) {
    if (url && url.length > 0) {
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
  },

})