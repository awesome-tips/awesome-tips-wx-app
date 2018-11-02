// components/feeds.js

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    feedList: {
      type: Array
    },
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 列表项点击
    itemClickSubmit: function (event) {
      // 缓存 formId
      const formId = event.detail.formId
      if (formId) {
        const app = getApp()
        app.push.addFormId(formId)
      }
      // 跳转到小集详情
      const fid = event.detail.target.id
      if (fid) {
        wx.navigateTo({
          url: '/pages/detail/detail?fid=' + fid
        })
      }
    },
  }
})
