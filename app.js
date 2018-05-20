// app.js

const Towxml = require('./towxml/main')
const mta = require('./utils/mta_analysis.js')

App({
  // 全局数据
  globalData: {
    appFrom: 'wxapp',
    appVersion: '1.0.2',
  },

  towxml: new Towxml(),

  onLaunch: function (options) {
    console.log('App On Launch With Options:', options)
    
    // MTA 统计初始化
    mta.App.init({
      "appID": "500604211",
      "eventID": "500604331",
      "lauchOpts": options,
      "statPullDownFresh": true,
      "statReachBottom": true,
      "statShareApp": true
    })
  },

  onShow: function () {
    console.log('App On Show')
  },

  onHide: function () {
    console.log('App On Hide')
  },

})