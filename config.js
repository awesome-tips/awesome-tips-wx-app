/**
 * 小程序配置文件
 */

var apiHost = "https://app.kangzubin.com/iostips/api"

var config = {
  // 列表
  feedListUrl: `${apiHost}/feed/list`,
  // 搜索
  feedSearchUrl: `${apiHost}/feed/search`,
  // 详情
  feedDetailUrl: `${apiHost}/feed/detail`,
}

module.exports = config