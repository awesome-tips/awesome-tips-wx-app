/**
 * 小程序配置文件（目前只有接口 URL 地址）
 */

// const apiHost = "http://localhost/AwesomeTips/api"
const apiHost = "https://tips.kangzubin.com/api"

const config = {
  // 列表
  feedListUrl:        `${apiHost}/feed/list`,
  // 搜索
  feedSearchUrl:      `${apiHost}/feed/search`,
  // 详情
  feedDetailUrl:      `${apiHost}/feed/detail`,
  // 收藏操作
  feedFavorlUrl:      `${apiHost}/feed/favor`,
  // 收藏列表
  feedFavorListUrl:   `${apiHost}/feed/favorList`,
  // 用户登录
  userLoginUrl:       `${apiHost}/user/login`,
  // 更新用户信息
  userUpdateUrl:      `${apiHost}/user/update`,
  // 发现页数据
  discoverIndexUrl:   `${apiHost}/discover/index`,
  // 订阅小集操作
  pushOpenWxUrl:      `${apiHost}/push/openWx`,
  // 上传订阅推送的 formIds
  pushUploadFormIdsUrl: `${apiHost}/push/uploadFormIds`,
}

module.exports = config