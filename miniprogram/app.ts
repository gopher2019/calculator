App<IAppOption & {
  globalData: {
    userInfo: any;
  };
}>({
  globalData: {
    userInfo: null,
  },

  onLaunch() {
    // 本地存储演示
    const logs: number[] = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 云开发初始化 + 自动登录
    wx.cloud.init({
      env: 'cloud1-d8ghq1ib583e14043',
      traceUser: true,
    });
    this.autoLogin();
  },

  autoLogin() {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: (res: any) => {
        const result = res.result as {
          code: number; msg: string; isNew: boolean;
          data: { id: number; nickname: string; create_time: number; update_time: number; open_id: string };
        };
        if (result.code === 0) {
          this.globalData.userInfo = result.data;
          console.log(result.isNew ? '[新用户注册]' : '[老用户登录]', 'id=' + result.data.id);
        } else {
          console.error('[登录失败]', result.msg);
        }
      },
      fail: (err: any) => {
        console.error('[云函数调用失败]', err);
      },
    });
  },
});
