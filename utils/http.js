/**
 * 小程序 HTTP 请求封装
 */

const appFrom = 'wxapp'
const appVersion = '1.2.0'

const HTTP = {
  token: null,
  
  GET: function(request) {
    var self = this
    wx.request({
      url: request.url,
      data: request.data,
      header: {
        'from': appFrom,
        'version': appVersion,
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
    var self = this
    wx.request({
      url: request.url,
      data: request.data,
      header: {
        'from': appFrom,
        'version': appVersion,
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