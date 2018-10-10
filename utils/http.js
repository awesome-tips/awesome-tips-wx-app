/**
 * 小程序 HTTP 请求封装
 */

const HTTP = {
  token: null,
  version: '1.2.0',
  
  GET: function(request) {
    const self = this
    wx.request({
      url: request.url,
      data: request.data,
      header: {
        'from': 'wxapp',
        'version': self.version,
        'token': self.token
      },
      method: 'GET',
      dataType: 'json',
      responseType: 'text',
      success: request.success,
      fail: request.fail,
      complete: request.complete,
    })
  },

  POST: function(request) {
    const self = this
    wx.request({
      url: request.url,
      data: request.data,
      header: {
        'from': 'wxapp',
        'version': self.version,
        'content-type': 'application/x-www-form-urlencoded',
        'token': self.token
      },
      method: 'POST',
      dataType: 'json',
      responseType: 'text',
      success: request.success,
      fail: request.fail,
      complete: request.complete,
    })
  }
}

module.exports = HTTP