const app = getApp();

// 将 "2026-10-24 16:03:04" 解析成时间戳，用于排序（兼容缺失情况）
function parseTime(str) {
  if (!str) return 0;
  const t = new Date(String(str).replace(/-/g, '/')).getTime();
  return isNaN(t) ? 0 : t;
}

Page({
  data: {
    list: [],
    loading: true,
    adHidden: false,
  },

  onShow() {
    this.loadList();
  },

  onPullDownRefresh() {
    this.loadList(true);
  },

  // 按 openid 拉取“我”提交过的反馈（集合默认仅创建者可读写，只能查到自己）
  // stopRefresh: 是否在下拉刷新结束后收起系统刷新动画（仅 onPullDownRefresh 时传 true）
  async loadList(stopRefresh = false) {
    this.setData({ loading: true });
    try {
      if (app && typeof app.ensureLogin === 'function') {
        await app.ensureLogin();
      }
    } catch (e) {
      console.error('[ensureLogin 失败]', e);
    }
    const openid =
      (app.globalData && app.globalData.userInfo && app.globalData.userInfo.open_id) || '';
    if (!openid) {
      this.setData({ list: [], loading: false });
      wx.showToast({ title: '请稍后重试', icon: 'none' });
      if (stopRefresh) wx.stopPullDownRefresh();
      return;
    }
    const db = wx.cloud.database();
    db.collection('feedback')
      .where({ openid })
      .get({
        success: (res) => {
          const list = (res.data || []).map((it) => ({
            _id: it._id,
            type: it.type || '其他',
            content: it.content || '',
            contact: it.contact || '',
            createTime: it.createTime || '',
            reply: it.reply || '',
            replied: !!(it.reply && String(it.reply).trim()),
          }));
          list.sort((a, b) => parseTime(b.createTime) - parseTime(a.createTime));
          this.setData({ list, loading: false });
          if (stopRefresh) wx.stopPullDownRefresh();
        },
        fail: (err) => {
          console.error('[我的反馈加载失败]', err);
          this.setData({ loading: false });
          wx.showToast({ title: '加载失败', icon: 'none' });
          if (stopRefresh) wx.stopPullDownRefresh();
        },
      });
  },

  goFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  onAdLoad() {},

  onAdError(err) {
    console.error('[我的反馈广告加载失败]', err);
    this.setData({ adHidden: true });
  },

  onAdClose() {},

  onShareAppMessage() {
    return {
      title: '墨狐小算器｜我的反馈',
      path: 'pages/myFeedback/myFeedback',
    };
  },
});
