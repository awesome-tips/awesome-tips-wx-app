// pages/discover/discover.js

const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dataList: [],
    boxIndex: {
      0: "one",
      1: "two",
      2: "three",
      3: "four",
      4: "five",
      5: "six"
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.mta.Page.init()
    this.init()
  },

  init: function() {
    const self = this
    
    let result = [
      {
        "id": 1,
        "name": "微博一周推送",
        "number": "139",
      },
      {
        "id": 2,
        "name": "简报",
        "number": "445",
      },
      {
        "id": 3,
        "name": "英文版",
        "number": "15",
      },
      {
        "id": 4,
        "name": "iOS 知识小集合集",
        "number": "25",
      },
      {
        "id": 5,
        "name": "公众号文章",
        "number": "20",
      },
      {
        "id": 6,
        "name": "更多小集",
        "number": "666",
      },
      {
        "id": 7,
        "name": "猿小荐：专注于移动开发职位分享",
        "number": "",
      },
      {
        "id": 8,
        "name": "React Native",
        "number": "12",
      },
      {
        "id": 9,
        "name": "Weex",
        "number": "8",
      },
      {
        "id": 10,
        "name": "Flutter",
        "number": "4",
      },
      {
        "id": 11,
        "name": "微信小程序",
        "number": "6",
      },
      {
        "id": 12,
        "name": "比较三种网络框架上传图片过程中的不同点",
        "number": "61",
      },
      {
        "id": 13,
        "name": "通过 runtime 控制导航栏的 hidden 属性",
        "number": "143",
      },
      {
        "id": 14,
        "name": "关于 IAP 丢单的处理",
        "number": "223",
      },
      {
        "id": 15,
        "name": "iOS App 的反调试（Anti-Debug）",
        "number": "1345",
      },
      {
        "id": 16,
        "name": "如何快速定位哪个 View 出现了约束警告？",
        "number": "32",
      },
      {
        "id": 17,
        "name": "聊聊 AutoLayout 的一对属性",
        "number": "124",
      },
    ]

    result.map(function (item, intex) {
      switch (intex) {
        case 0:
          item.name = self.stringCut(item.name, 23)
          break;
        case 1:
          item.name = self.stringCut(item.name, 13)
          break;
        case 2:
          item.name = self.stringCut(item.name, 8)
          break;
        case 3:
          item.name = self.stringCut(item.name, 28)
          break;
        case 4:
          item.name = self.stringCut(item.name, 22)
          break;
        case 5:
          item.name = self.stringCut(item.name, 10)
          break;
        case 6:
          item.name = self.stringCut(item.name, 21)
          break;
        case 7:
          item.name = self.stringCut(item.name, 12)
          break;
        case 8:
          item.name = self.stringCut(item.name, 9)
          break;
        case 9:
          item.name = self.stringCut(item.name, 28)
          break;
        case 10:
          item.name = self.stringCut(item.name, 25)
          break;
        case 11:
          item.name = self.stringCut(item.name, 13)
          break;
        case 12:
          item.name = self.stringCut(item.name, 23)
          break;
        case 13:
          item.name = self.stringCut(item.name, 8)
          break;
        case 14:
          item.name = self.stringCut(item.name, 28)
          break;
        case 15:
          item.name = self.stringCut(item.name, 22)
          break;
        case 16:
          item.name = self.stringCut(item.name, 19)
          break;
      }
    })

    var tempList = []
    var a = result.splice(0, 6)
    tempList.push(a)

    if (result.length > 0) {
      var b = result.splice(0, 5)
      tempList.push(b)
    }
    if (result.length > 0) {
      tempList.push(result)
    }
    self.setData({
      dataList: tempList
    })

  },

  stringCut: function (t, e) {
    return t.length > e && (t = t.substring(0, e - 2) + "..."), t;
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
    setTimeout(function () {
      wx.stopPullDownRefresh()
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