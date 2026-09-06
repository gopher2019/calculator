// index.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

Page({
  ...shareConfig,

  data: {
    nickname: '',
    userId: '',
    // 首页底部原生模板广告位真实高度（rpx），加载后实测并动态适配
    adReserve: 0,
    // 广告加载失败时隐藏广告位，避免空占位
    adHidden: false,
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

  goToWeaponCalc() {
    wx.navigateTo({ url: '../weapon/weapon' });
  },

  goToMine() {
    wx.navigateTo({ url: '../mine/mine' });
  },

  goToXiaoxiao() {
    wx.navigateTo({ url: '../xiaoxiao/xiaoxiao' });
  },

  goToWuHun() {
    wx.navigateTo({ url: '../wuhun/wuhun' });
  },

  goToTeam() {
    wx.navigateTo({ url: '../team/team' });
  },

  goToExp() {
    wx.navigateTo({ url: '../exp/exp' });
  },

  goToHandcraft() {
    wx.navigateTo({ url: '../handcraft/handcraft' });
  },

  goToActivityPoints() {
    wx.navigateTo({ url: '../activitypoints/activitypoints' });
  },

  goToAntifraud() {
    wx.navigateTo({ url: '../antifraud/antifraud' });
  },

  goToSaocao() {
    wx.navigateTo({ url: '../saocaozuo/saocaozuo' });
  },

  // 原生模板广告加载成功：多次实测、以最终稳定高度为准（广告先占位后收缩），避免预留过高留白
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-slot')
        .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | undefined) => {
          if (!rect || !rect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          const rpx = Math.ceil((rect.height * 750) / winWidth);
          this.setData({ adReserve: rpx });
        })
        .exec();
    };
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：隐藏广告位，避免空占位
  onAdError() {
    this.setData({ adReserve: 0, adHidden: true });
  },
});
