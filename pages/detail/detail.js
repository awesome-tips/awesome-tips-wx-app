// detail.js

const app = getApp()
const mta = require('../../utils/mta_analysis.js')
const feedDetailUrl = require('../../config').feedDetailUrl

Page({

  /**
   * 页面的初始数据
   */
  data: {
    fid: null,
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

    var self = this
    var fid = options.fid
    if (fid) {
      this.setData({
        fid: fid
      })
      // 调接口加载小集详情
      this.getFeedDetail()
    } else {
      this.feedNotFoundError()
    }
  },

  getFeedDetail: function () {
    var self = this

    if (self.data.fid == null) {
      return;
    }

    wx.showLoading({
      icon: 'loading'
    })

    // 标记正在加载中
    self.data.loading = true

    wx.request({
      url: feedDetailUrl,
      method: 'GET',
      dataType: 'json',
      data: {
        fid: self.data.fid
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
            return;
          } else {
            self.feedNotFoundError()
          }
        }
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

  feedConetntRendering: function () {
    var self = this
    var feed = self.data.feed
    if (!feed) {
      return
    }

    var contentType = 'markdown'
    if (feed.type == 1) {
      contentType = 'html'
    }
    var content = feed.content;
    if (!content || content.length == 0) {
      content = '暂时无法加载该小集详情，请复制原文链接后在浏览器中打开查看。'
    }
    
    let articleData = app.towxml.toJson(content, contentType);
    // console.log(articleData)
    self.setData({
      article: articleData,
      pageHide: false
    });
    wx.hideLoading()
  },

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
  // onPullDownRefresh: function () {
  
  // },

  /**
   * 页面上拉触底事件的处理函数
   */
  // onReachBottom: function () {
  
  // },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var self = this
    if (self.data.feed) {
      var title = self.data.feed.title
      var path = 'pages/detail/detail?fid=' + self.data.feed.fid
      return {
        title: title,
        path: path,
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    } else {
      return null
    }
  },

  // 复制原文链接
  copyLinkButtonClick: function () {
    var self = this
    if (self.data.fid && self.data.feed) {
      wx.setClipboardData({
        data: self.data.feed.url,
        success: function (res) {
          wx.showToast({
            icon: 'success',
            title: '链接已复制'
          })
        }
      })
    }
  },

  // 复制文中链接
  onUrlLinkTap: function (sender) {
    var url = sender.currentTarget.dataset.url;
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

  // 打开图片浏览
  onImageTap: function (sender) {
    var url = sender.currentTarget.dataset.src;
    if (url && url.length > 0) {
      wx.previewImage({
        current: url,
        urls: [url]
      })
    }
  }

})