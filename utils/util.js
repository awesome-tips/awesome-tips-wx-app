/**
 * 小程序工具方法
 */

// 弹窗确认复制链接
function setUrlToClipboard(title, url) {
  if (url && url.length > 0) {
    wx.showModal({
      title: title,
      content: url,
      cancelText: '关闭',
      confirmText: '复制链接',
      success: function (res) {
        if (res.confirm) {
          // 点击了确定按钮
          wx.setClipboardData({
            data: url,
            success: function (res) {
              wx.showToast({
                icon: 'success',
                title: '链接已复制'
              })
            }
          })
        } else if (res.cancel) {
          // 点击了取消按钮
        }
      }
    })
  }
}

// 文中链接点击
function onUrlLinkTap(sender) {
  const url = sender.currentTarget.dataset.url
  const title = sender.currentTarget.dataset.title
  setUrlToClipboard(title, url)
}

// 文中图片点击，浏览大图
function onImageTap(sender) {
  const url = sender.currentTarget.dataset.src
  if (url && url.length > 0) {
    wx.previewImage({
      current: url,
      urls: [url]
    })
  }
}

module.exports = {
  setUrlToClipboard: setUrlToClipboard,
  onUrlLinkTap: onUrlLinkTap,
  onImageTap: onImageTap,
}