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
    // 顶部滚动公告（位于昵称行）：从右往左连续轮播（多条拼接成单串）
    // 未拿到公告时，默认展示这句文案
    noticeText: '怀旧天龙少侠的实用小工具',
    // 轮播时长（秒），按文案长度动态算，保持滚动速度一致
    noticeDur: 20,
  },

  onLoad() {
    enableShareMenu();
  },

  onShow() {
    // 懒加载登录（仅在展示昵称时按需拉取 openid，不在启动阶段触发隐私授权）
    const app = getApp() as any;
    if (app && typeof app.ensureLogin === 'function') app.ensureLogin();
    this.refreshUser();
    this.loadNotice();
  },

  // 读取顶部公告：优先用 24 小时本地缓存，过期再从云数据库拉取全部
  loadNotice() {
    const KEY = 'noticeCache';
    const CACHE_MS = 24 * 60 * 60 * 1000;
    const cache = wx.getStorageSync(KEY);
    const now = Date.now();
    if (cache && cache.time && now - cache.time < CACHE_MS && Array.isArray(cache.data)) {
      this.applyNotice(cache.data);
      return;
    }
    const db = wx.cloud.database();
    db.collection('notice')
      .orderBy('sort', 'asc')
      .get({
        success: (res: any) => {
          const list = (res.data || []).map((it: any) => ({
            _id: it._id,
            content: it.content || '',
            sort: it.sort || 0,
          }));
          // 仅在有数据时才写缓存；空结果不缓存，避免“首次无数据→24h 空缓存”
          if (list.length > 0) {
            wx.setStorageSync(KEY, { time: Date.now(), data: list });
          }
          this.applyNotice(list);
        },
        fail: (err: any) => {
          console.error('[公告加载失败]', err);
          this.setData({ noticeText: '怀旧天龙少侠的实用小工具', noticeDur: 20 });
        },
      });
  },

  // 应用公告：把多条文案拼成一个完整文本，由 CSS 从右往左连续轮播（不再逐条计时切换）
  // 未拿到任何文案时，回退默认文案
  applyNotice(list: any[]) {
    let text: string;
    if (!list || list.length === 0) {
      text = '怀旧天龙少侠的实用小工具';
    } else {
      const items = list
        .map((it: any) => it.content || '')
        .filter((t: string) => t);
      text = items.length > 0 ? items.join('　•　') : '怀旧天龙少侠的实用小工具';
    }
    // 时长随文案长度线性增长，保证滚动速度大致恒定（约每字 0.5s，最短 12s）
    const dur = Math.max(12, Math.ceil(text.length * 0.5));
    this.setData({ noticeText: text, noticeDur: dur });
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

  goToMoney() {
    wx.navigateTo({ url: '../money/money' });
  },

  goToFeedback() {
    wx.navigateTo({ url: '../feedback/feedback' });
  },

  goToEquipBonus() {
    wx.navigateTo({ url: '../equipbonus/equipbonus' });
  },

  goToBeastBonus() {
    wx.navigateTo({ url: '../beastbonus/beastbonus' });
  },

  goToBabySkill() {
    wx.navigateTo({ url: '../babyskill/babyskill' });
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
