const app = getApp();

// 格式化为 "2026-10-24 16:03:04"
function pad(n) {
  return n < 10 ? '0' + n : '' + n;
}
function formatTime(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
    ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}

Page({
  onShareAppMessage() {
    return {
      title: '墨狐小算器｜留言反馈｜天龙怀旧服工具',
      path: 'pages/feedback/feedback',
      desc: '天龙八部怀旧服实用工具-墨狐小算器，包含攻略、点位、计算器，方便带队刷本、防骗、材料收购计算等。'
    };
  },

  onAdLoad() {},

  onAdError(err) {
    console.error('[反馈页广告加载失败]', err); // 打印失败原因，便于排查
    this.setData({ adHidden: true }); // 加载失败则隐藏广告位
  },

  onAdClose() {},

  data: {
    types: ['问题反馈', '功能建议', '其他'],
    type: '问题反馈',
    content: '',
    contact: '',
    submitting: false,
    adHidden: false,
  },

  onTypeTap(e) {
    this.setData({ type: e.currentTarget.dataset.type });
  },

  onContentInput(e) {
    this.setData({ content: e.detail.value });
  },

  onContactInput(e) {
    this.setData({ contact: e.detail.value });
  },

  onSubmit() {
    const { type, content, contact, submitting } = this.data;
    const text = (content || '').trim();
    if (!text) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' });
      return;
    }
    if (submitting) return;
    this.setData({ submitting: true });
    wx.showLoading({ title: '提交中' });

    const db = wx.cloud.database();
    const userInfo = (app.globalData && app.globalData.userInfo) || null;
    db.collection('feedback').add({
      data: {
        type,
        content: text,
        contact: (contact || '').trim(),
        openid: userInfo ? userInfo.open_id : '',
        nickname: userInfo ? userInfo.nickname : '',
        status: 'pending',
        createTime: formatTime(new Date()),
      },
      success: () => {
        wx.hideLoading();
        wx.showToast({ title: '感谢反馈！', icon: 'success' });
        this.setData({ content: '', contact: '', type: '问题反馈', submitting: false });
        setTimeout(() => {
          if (getCurrentPages().length > 1) wx.navigateBack();
        }, 800);
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('[反馈提交失败]', err);
        wx.showToast({ title: '提交失败，请稍后重试', icon: 'none' });
        this.setData({ submitting: false });
      },
    });
  },
});
