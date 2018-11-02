/**
 * 小程序 HTTP 请求封装
 */

const HTTP = {
  GET: function (request) {
    const self = this
    const app = getApp()
    wx.request({
      url: request.url,
      data: request.data,
      header: {
        'from': 'wxapp',
        'version': app.version,
        'token': app.globalData.token ? app.globalData.token : ''
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        // 接口调用成功，解析服务端返回数据
        self.processSuccessRes(request, res)
      },
      fail: function (err) {
        // 接口调用失败
        if (typeof (request.fail) == 'function') {
          request.fail(err)
        }
      },
      complete: function (res) {
        // 接口调用结束
        if (typeof (request.complete) == 'function') {
          request.complete(res)
        }
      }
    })
  },

  POST: function (request) {
    const self = this
    const app = getApp()
    wx.request({
      url: request.url,
      data: request.data,
      header: {
        'from': 'wxapp',
        'version': app.version,
        'token': app.globalData.token ? app.globalData.token : '',
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: function (res) {
        // 接口调用成功，解析服务端返回数据
        self.processSuccessRes(request, res)
      },
      fail: function (err) {
        // 接口调用失败
        if (typeof (request.fail) == 'function') {
          request.fail(err)
        }
      },
      complete: function (res) {
        // 接口调用结束
        if (typeof (request.complete) == 'function') {
          request.complete(res)
        }
      }
    })
  },

  processSuccessRes: function (request, res) {
    const app = getApp()
    let responseObj = res.data
    if (typeof (responseObj) == 'object') {
      if (responseObj.code == 0) {
        // 接口响应码成功
        if (typeof (request.success) == 'function') {
          request.success(responseObj)
        }
        return // 执行成功回调并返回
      } else if (responseObj.code == -1) {
        // 未登录，或者登录态已失效，需要重新登录
        console.log('未登录，或者登录态已失效，重新登录中...')
        app.doWXUserLogin()
      }
    }
    // 接口响应码失败，此处执行失败回调
    if (typeof (request.fail) == 'function') {
      request.fail(res)
    }
  }
}

module.exports = HTTP