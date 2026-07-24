// index.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

Page({
  ...shareConfig,

  data: {
    nickname: '',
    userId: '',
  },

  onLoad() {
    enableShareMenu();
  },

  onShow() {
    this.refreshUser();
  },

  // 云登录为异步，未返回时短暂轮询读取昵称与 id
  refreshUser(retry = 0) {
    const app = getApp() as { globalData: { userInfo: any } };
    const user = app.globalData.userInfo;
    if (user && user.nickname) {
      this.setData({ nickname: user.nickname, userId: user.id });
    } else if (retry < 20) {
      setTimeout(() => this.refreshUser(retry + 1), 200);
    }
  },

  goToBeastCalc() {
    wx.navigateTo({ url: '../beast/beast' });
  },

  goToGrowthCalc() {
    wx.navigateTo({ url: '../growth/growth' });
  },

  goToGameRecord() {
    wx.navigateTo({ url: '../gameRecord/gameRecord' });
  },

  goToSect() {
    wx.navigateTo({ url: '../sect/sect' });
  },
});
