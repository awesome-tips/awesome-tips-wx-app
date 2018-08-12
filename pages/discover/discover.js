// pages/discover/discover.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageHide: true,
    loading: false,
    topButton: null,
    dataList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()
    wx.showNavigationBarLoading()

    const self = this

    let topButton = wx.getStorageSync('discover-topButton')
    let dataList = wx.getStorageSync('discover-dataList')
    if (topButton && dataList) {
      self.setData({
        topButton: topButton,
        dataList: dataList,
        pageHide: false
      })
      setTimeout(function () {
        self.getDiscoverData()
      }, 500)
    } else {
      self.getDiscoverData()
    }
  },

  getDiscoverData: function() {
    const self = this

    if (self.data.loading) {
      return
    }

    self.data.loading = true

    app.HTTP.GET({
      url: app.URL.discoverIndexUrl,
      success: function (result) {
        console.log('Discover data request success', result)
        if (result.data.code == 0) {
          let topButton = result.data.data.topButton
          if (topButton) {
            self.setData({
              topButton: topButton
            })
            wx.setStorage({
              key: 'discover-topButton',
              data: topButton
            })
          }
          let dataList = result.data.data.dataList
          if (dataList && dataList.length > 0) {
            self.setDataList(dataList)
          }
          self.setData({
            pageHide: false
          })
        }
      },
      fail: function (errMsg) {
        console.log('Discover data request fail', errMsg)
      },
      complete: function () {
        self.data.loading = false
        wx.stopPullDownRefresh()
        wx.hideNavigationBarLoading()
      }
    })
  },

  setDataList: function(dataList) {
    const self = this
    if (dataList.length >= 3) {
      // 推荐小集的标题过长裁剪
      let box3 = dataList[2]
      box3.map(function (item, intex) {
        switch (intex) {
          case 0:
            item.name = self.stringCut(item.name, 10)
            break;
          case 1:
            item.name = self.stringCut(item.name, 20)
            break;
          case 2:
            item.name = self.stringCut(item.name, 7)
            break;
          case 3:
            item.name = self.stringCut(item.name, 22)
            break;
          case 4:
            item.name = self.stringCut(item.name, 21)
            break;
          case 5:
            item.name = self.stringCut(item.name, 13)
            break;
          default:
            break
        }
      })
      dataList[2] = box3
    }

    self.setData({
      dataList: dataList
    })

    wx.setStorage({
      key: 'discover-dataList',
      data: dataList
    })
  },

  stringCut: function (str, limit) {
    return (str.length > limit) && (str = str.substring(0, limit - 1) + "..."), str;
  },

  onBoxItemClick: function (event) {
    const item = event.currentTarget.dataset.boxitem
    if (item) {
      if (item.type == 'filter') {
        if (item.filter && item.filter.length > 0) {
          wx.navigateTo({
            url: '../filter/filter?filter=' + item.filter + '&title=' + item.name
          })
        }
      } else if (item.type == 'page') {
        if (item.url && item.url.length > 0) {
          wx.navigateTo({
            url: item.url
          })
        }
      } else if (item.type == 'app') {
        if (item.appid && item.appid.length > 0) {
          wx.navigateToMiniProgram({
            appId: item.appid
          })
        }
      } else if (item.type == 'tips') {
        if (item.fid && item.fid.length > 0) {
          wx.navigateTo({
            url: '../detail/detail?fid=' + item.fid
          })
        }
      }
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
    const self = this
    if (self.data.loading) {
      return
    }
    setTimeout(function () {
      self.getDiscoverData()
    }, 1000)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: '发现知识小集',
      path: 'pages/discover/discover?from=share',
      imageUrl: 'https://tips.kangzubin.com/share.jpg'
    }
  },

})