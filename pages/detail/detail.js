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
    fromShare: false,
    favorTitle: '收藏',
    isIPX: app.globalData.isIPX,
    loginError: false, // 标识登录失败，显示重试按钮
    article: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()

    if (options.from && options.from == 'share') {
      this.data.fromShare = true
    }

    if (options.fid) {
      this.data.fid = options.fid

      // 调接口加载小集详情
      if (app.globalData.hasLogined) {
        // 已登录
        wx.showLoading()
        this.getFeedDetail()
      } else {
        if (app.globalData.loginError) {
          // 登录已失败，显示错误页面
          this.showLoginErrorPage()
        } else {
          // 正在登录中
          wx.showLoading()
        }
        const self = this
        // 设置登录成功回调
        app.addLoginReadyCallback(function () {
          // 请求列表数据
          self.getFeedDetail()
        })
        // 设置登录失败回调
        app.loginFailCallback = function () {
          wx.hideLoading()
          self.showLoginErrorPage()
        }
      }
    } else {
      this.feedNotFoundError()
    }
  },

  // 显示登录错误页面
  showLoginErrorPage: function () {
    this.setData({
      hidePage: true,
      loginError: true
    })
  },

  // 登录按钮重试
  reLoginButtonClick: function () {
    this.setData({
      loginError: false
    })
    wx.showLoading()
    app.doWXUserLogin()
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
        console.log('Feed detail request success:', result)
        const feed = result.data.feed
        if (feed) {
          self.setData({
            feed: feed
          })
          self.feedConetntRendering()
        } else {
          self.feedNotFoundError()
          wx.hideLoading()
        }
      },
      fail: function (errMsg) {
        console.log('Feed detail request fail:', errMsg)
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
      if (feed.platform == 1) {
        // 公众号文章
        content = '我们的小程序暂时无法加载公众号文章，请复制原文链接后在浏览器中打开查看。\r\n\r\n你也可以关注我们的“知识小集”公众号获取更多文技术章。'
      } else if (feed.platform == 3) {
        // Medium 链接
        content = '知识小集的英文版由 **@故胤道长** 维护并定期发布在 Medium 平台上。\r\n\r\n由于小程序暂时无法加载外链，请复制原文链接后在浏览器中打开查看，需要自行翻墙才能访问哦。'
      } else {
        content = '暂时无法加载该小集详情，请复制原文链接后在浏览器中打开查看。'
      }
    }
    content = content + '\r\n\r\n[原文链接](' + feed.url + ')'
    
    let articleData = app.render.toJson(content, contentType)
    self.setData({
      article: articleData,
      pageHide: false,
      fromShare: self.data.fromShare
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
      const path = '/pages/detail/detail?from=share&fid=' + self.data.feed.fid
      return {
        title: title,
        path: path,
        imageUrl: 'https://tips.kangzubin.com/share.jpg'
      }
    } else {
      return null
    }
  },

  // 订阅点击
  subscribeSubmit: function (event) {
    const btnId = event.detail.target.id
    const formId = event.detail.formId
    if (formId) {
      if (btnId == 0) {
        app.push.subscribe(formId)
      } else {
        app.push.addFormId(formId)
      }
    }
    if (btnId == 0) {
      // 订阅小集
    } else if (btnId == 1) {
      // 收藏小集
      if (this.data.feed.platform != 0) {
        wx.showToast({
          icon: 'none',
          title: '文章类型不能收藏'
        })
        return
      }
      this.submitFavor()
    } else if (btnId == 2) {
      // 跳转到首页
      wx.reLaunch({
        url: "/pages/index/index"
      });
    }
  },

  // 收藏按钮点击
  submitFavor: function () {
    const self = this
    
    if (!app.globalData.hasLogined) {
      app.reLoginThenCallback(function(){
        self.submitFavor()
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
        console.log('Feed favor request success:', result)
        wx.hideLoading()
        wx.showToast({
          icon: 'success',
          title: favorValue == 0 ? '取消收藏成功' : '收藏成功'
        })
        const favorTitleValue = favorValue == 0 ? '收藏' : '取消收藏'
        self.data.feed.favor = favorValue
        self.setData({
          favorTitle: favorTitleValue
        })
      },
      fail: function (errMsg) {
        console.log('Feed favor request fail:', errMsg)
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