// handcraft.js —— 手工DIY 原生页面逻辑
// 说明：所有次数判断、扣减、发奖均在云函数校验，前端只负责展示与交互
// 云存储图片需用 wx.cloud.getTempFileURL 将 cloud:// fileID 换成 https 临时地址后才能被 <image> 正常展示

// 各类型「未鉴定」占位图 fileID（制作完成后展示）
const UNIDENT_MAP = {
  xianglian:
    'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/shougong/xianglian/85/weijianding.png',
  hufu:
    'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/shougong/hufu/85/weijianding.png',
};

// 各类型「成品图」目录前缀与总数（鉴定时客户端随机取图，避免依赖云函数部署）
const RESULT_MAP = {
  xianglian: {
    prefix:
      'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/shougong/xianglian/85/',
    total: 104,
  },
  hufu: {
    prefix:
      'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/shougong/hufu/85/',
    total: 149,
  },
};

// 激励视频广告单元 ID
const AD_UNIT_ID = 'adunit-7b3a2bb5fc6e88bb';

Page({
  data: {
    remainCount: 0,      // 今日剩余制作次数
    adRewardToday: false, // 今日是否已领取广告奖励
    isMaking: false,     // 制作中（防重复点击 / 进度条）
    showProgress: false, // 是否展示进度条
    progress: 0,         // 进度 0~100
    phase: 'idle',       // 展示阶段：idle / made / identified（制作图与成品图共用同一舞台）
    madeImageCache: '',  // 未鉴定图缓存（https 临时地址，复用避免重复换取）
    resultImage: '',     // 鉴定成品图（https 临时地址）
    craftType: 'xianglian', // 制作类型：xianglian（项链）/ hufu（护符），共用次数
  },

  onLoad() {
    this.ad = null;
    this.adShowing = false;
    this.initAd();
    this.loadUser();
  },

  // 将 cloud:// fileID 转换为 https 临时访问地址
  // 注意：本环境存储 ACL 为私有，前端直接调 wx.cloud.getTempFileURL 会返回空 tempFileURL，
  // 因此统一走已有的 getImageUrl 云函数（管理员身份）换取临时地址，绕过客户端读权限限制
  getTempUrl(fileID) {
    return wx.cloud
      .callFunction({ name: 'getImageUrl', data: { fileList: [fileID] } })
      .then((res) => {
        const r = res.result;
        const item = r && r.list && r.list[0];
        if (r && r.code === 0 && item && item.tempFileURL) {
          return item.tempFileURL;
        }
        throw new Error('empty tempFileURL: ' + JSON.stringify(r));
      });
  },

  // 拉取并重置用户当日数据
  loadUser() {
    wx.showLoading({ title: '加载中' });
    wx.cloud
      .callFunction({ name: 'handcraft_getUserInfo' })
      .then((res) => {
        wx.hideLoading();
        const r = res.result;
        if (r && r.code === 0) {
          this.setData({
            remainCount: r.data.remainCount,
            adRewardToday: r.data.ad_reward_today,
          });
        } else {
          wx.showToast({ title: '加载失败', icon: 'none' });
        }
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误', icon: 'none' });
      });
  },

  // 开始制作
  async onMake() {
    if (this.data.isMaking) return;
    if (this.data.remainCount <= 0) {
      wx.showToast({ title: '制作次数不足', icon: 'none' });
      return;
    }

    this.setData({
      isMaking: true,
      showProgress: true,
      progress: 0,
      phase: 'idle',
      resultImage: '',
    });
    this.startProgress();

    try {
      const res = await wx.cloud.callFunction({ name: 'handcraft_make' });
      const r = res.result;
      if (r && r.code === 0) {
        // 未鉴定图严格按当前类型取（护符用自己的 weijianding，不复用项链），优先复用缓存
        let url = this.data.madeImageCache;
        if (!url) {
          url = await this.getTempUrl(UNIDENT_MAP[this.data.craftType]);
        }
        this.setData({
          remainCount: this.data.remainCount - 1,
          madeImageCache: url,
          phase: 'made',
        });
      } else if (r && r.code === -2) {
        wx.showToast({ title: '制作次数不足', icon: 'none' });
        this.setData({ remainCount: 0 });
      } else {
        wx.showToast({ title: '制作失败', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      this.setData({ isMaking: false });
      setTimeout(() => this.setData({ showProgress: false }), 300);
    }
  },

  // 1 秒进度条动画（每 100ms +10）
  startProgress() {
    let p = 0;
    const timer = setInterval(() => {
      p += 10;
      if (p >= 100) {
        p = 100;
        clearInterval(timer);
      }
      this.setData({ progress: p });
    }, 100);
  },

  // 鉴定（不消耗次数）：按当前类型随机取对应目录下的成品图
  async onIdentify() {
    if (this.data.phase !== 'made') {
      wx.showToast({ title: '请先制作', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '鉴定中' });
    try {
      const conf = RESULT_MAP[this.data.craftType];
      const n = Math.floor(Math.random() * conf.total) + 1;
      const fileID = `${conf.prefix}${n}.png`;
      // cloud:// fileID 先转成 https 临时地址再展示
      const url = await this.getTempUrl(fileID);
      // 同一舞台切换到成品图，未鉴定图仅隐藏（已缓存，再次制作时复用）
      this.setData({ phase: 'identified', resultImage: url });
    } catch (e) {
      wx.showToast({ title: '网络错误，请重试', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 切换制作类型（项链 / 护符）：共用次数，仅图片源不同；切换时重置舞台
  onTypeChange(e) {
    const type = e.currentTarget.dataset.type;
    if (type === this.data.craftType) return;
    this.setData({
      craftType: type,
      phase: 'idle',
      madeImageCache: '',
      resultImage: '',
    });
  },

  // 初始化激励视频广告（仅创建一次，复用实例，避免重复注册监听）
  initAd() {
    if (!AD_UNIT_ID || this.ad) return;
    const ad = wx.createRewardedVideoAd({ adUnitId: AD_UNIT_ID });

    ad.onError((err) => {
      console.error('[handcraft] 激励视频广告错误', err);
      wx.showToast({ title: '广告加载失败', icon: 'none' });
    });

    // 用户关闭广告：看完才发放奖励
    ad.onClose((res) => {
      if (res && res.isEnded) {
        this.grantAdReward();
      } else {
        wx.showToast({ title: '需看完广告才可获得奖励', icon: 'none' });
      }
    });

    this.ad = ad;
  },

  // 调用云函数发放广告奖励（+5 次）
  grantAdReward() {
    wx.showLoading({ title: '发放奖励中' });
    wx.cloud
      .callFunction({ name: 'handcraft_adReward' })
      .then((r) => {
        const rr = r.result;
        if (rr && rr.code === 0) {
          // 先乐观刷新本地次数，确保关闭广告后立即更新；随后 loadUser 再与服务器校准
          this.setData({
            remainCount: this.data.remainCount + 5,
            adRewardToday: true,
          });
          wx.showToast({ title: '获得5次机会', icon: 'success' });
          this.loadUser();
        } else if (rr && rr.code === -3) {
          wx.showToast({ title: '今日已领取', icon: 'none' });
          this.setData({ adRewardToday: true });
          this.loadUser();
        } else {
          wx.showToast({ title: '领取失败', icon: 'none' });
        }
      })
      .catch(() => {
        wx.showToast({ title: '网络错误', icon: 'none' });
      })
      .finally(() => wx.hideLoading());
  },

  // 观看广告领取 +5 次
  onWatchAd() {
    if (this.data.adRewardToday) {
      wx.showToast({ title: '今日已领取奖励', icon: 'none' });
      return;
    }
    if (!this.ad) {
      wx.showToast({ title: '广告暂不可用', icon: 'none' });
      return;
    }
    if (this.adShowing) return; // 防止重复触发
    this.adShowing = true;

    this.ad
      .show()
      .then(() => {
        this.adShowing = false;
      })
      .catch(() => {
        // 失败时重新加载再展示
        this.ad
          .load()
          .then(() => this.ad.show())
          .then(() => {
            this.adShowing = false;
          })
          .catch(() => {
            this.adShowing = false;
            wx.showToast({ title: '广告拉取失败', icon: 'none' });
          });
      });
  },
});
