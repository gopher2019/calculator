// index.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

Page({
  onShareAppMessage() {
    return {
      title: '墨狐小算器｜工具导航｜天龙怀旧服工具',
      path: 'pages/index/index',
      desc: '天龙八部怀旧服实用工具-墨狐小算器，包含攻略、点位、计算器，方便带队刷本、防骗、材料收购计算等。'
    };
  },

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

  goToMaterial() {
    wx.navigateTo({ url: '../material/material' });
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
        .select('.ad-card')
        .boundingClientRect()
        .select('.ad-slot')
        .boundingClientRect()
        .exec((res: any) => {
          const cardRect = res && res[0];
          const slotRect = res && res[1];
          // 广告尚未渲染出真实高度时跳过，避免把「只有内边距」的空高度当作预留值，导致底部卡片被遮挡
          if (!cardRect || !cardRect.height) return;
          if (!slotRect || !slotRect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          // 以广告槽位总高（广告高度 + 下内边距 + 安全区）作为预留，与固定底部占位完全一致
          const rpx = Math.ceil((slotRect.height * 750) / winWidth);
          this.setData({ adReserve: rpx });
        });
    };
    [200, 500, 1000, 1800, 3000].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：隐藏广告位，避免空占位
  onAdError() {
    this.setData({ adReserve: 0, adHidden: true });
  },
});
