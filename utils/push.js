/**
 * 小程序订阅推送管理
 */

const PUSH = {
  formIds: [], // 暂存收集的推送 formIds
  uploading: false, // 是否正在上传 formIds

  subscribe: function (formId) {
    const self = this
    const app = getApp()
    if (formId && formId != 'the formId is a mock one') {
      self.formIds.push(formId)
    }
    let isOpenPush = wx.getStorageSync('push')
    if (isOpenPush) {
      wx.showToast({
        title: '已订阅，小集更新时将自动推送给您',
        icon: 'none',
        duration: 2000
      })
    } else {
      // 提交订阅小集
      app.HTTP.POST({
        url: app.URL.pushOpenWxUrl,
        data: {
          is_open: 1,
        },
        success: function (res) {
          console.log('订阅小集成功:', res)
          wx.showToast({
            title: '已订阅，小集更新时将自动推送给您',
            icon: 'none',
            duration: 2000
          })
          wx.setStorageSync('push', true)
        },
        fail: function (err) {
          console.log('订阅小集失败:', err)
          wx.showToast({
            title: '订阅失败，请稍后重试',
            icon: 'none'
          })
        }
      })
    }
  },

  unsubscribe: function (formId) {
    const self = this
    const app = getApp()
    if (formId && formId != 'the formId is a mock one') {
      self.formIds.push(formId)
    }
    let isOpenPush = wx.getStorageSync('push')
    if (isOpenPush) {
      // 提交取消订阅小集
      app.HTTP.POST({
        url: app.URL.pushOpenWxUrl,
        data: {
          is_open: 0,
        },
        success: function (res) {
          console.log('取消订阅小集成功:', res)
          wx.showToast({
            title: '已取消订阅小集',
            icon: 'none',
            duration: 2000
          })
          wx.setStorageSync('push', false)
        },
        fail: function (err) {
          console.log('取消订阅小集失败:', err)
          wx.showToast({
            title: '取消订阅失败，请稍后重试',
            icon: 'none'
          })
        }
      })
    } else {
      wx.showToast({
        title: '已取消订阅小集',
        icon: 'none',
        duration: 2000
      })
    }
  },

  uploadFormIds: function () {
    const self = this
    const app = getApp()
    if (!app.globalData.hasLogined) {
      return
    }

    if (self.uploading) {
      return
    }

    if (self.formIds.length == 0) {
      return
    }

    let fIds = [].concat(self.formIds)
    self.formIds = []

    self.uploading = true

    app.HTTP.POST({
      url: app.URL.pushUploadFormIdsUrl,
      data: {
        'formIds': fIds,
      },
      success: function (res) {
        console.log('上传 formIds 成功:', res)
      },
      fail: function (err) {
        console.log('上传 formIds 失败:', err)
        // 上传失败，重新暂存，等下一次上传
        self.formIds.concat(fIds)
      },
      complete: function () {
        self.uploading = false
      }
    })
  }

}

module.exports = PUSH