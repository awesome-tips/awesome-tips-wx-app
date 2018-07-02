// pages/about/about.js

const app = getApp()
const mta = require('../../utils/mta_analysis.js')
const feedDetailUrl = require('../../config').feedDetailUrl

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fid: 148,
    feed: null,
    loading: false,
    pageHide: true,
    article: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    mta.Page.init()
    wx.showLoading({
      icon: 'loading'
    })

    // 调接口加载小集详情（关于我们）
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
        console.log('Feed about request success', result)
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
        wx.hideLoading()
      },
      fail: function (errMsg) {
        console.log('Feed about request fail', errMsg)
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

    let contentType = 'markdown'
    if (feed.type == 1) {
      contentType = 'html'
    }
    let content = feed.content
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

  // 复制文中链接
  onUrlLinkTap: function (sender) {
    const url = sender.currentTarget.dataset.url
    this.setUrlToClipboard(url)
  },

  // 打开图片浏览
  onImageTap: function (sender) {
    const url = sender.currentTarget.dataset.src
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