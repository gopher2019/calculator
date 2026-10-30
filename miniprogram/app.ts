// 扩展框架全局 IAppOption，声明自定义方法，消除 TS “属性不存在” 报错
declare interface IAppOption {
  initPrivacy(): void;
  autoLogin(): Promise<void>;
  ensureLogin(): Promise<void>;
}

App<IAppOption & {
  globalData: {
    userInfo: any;
  };
}>({
  globalData: {
    userInfo: null as any,
  },

  onLaunch() {
    // 本地存储演示
    const logs: number[] = wx.getStorageSync('logs') || [];
    logs.unshift(Date.now());
    wx.setStorageSync('logs', logs);

    // 云开发初始化
    wx.cloud.init({
      env: 'cloud1-d8ghq1ib583e14043',
      traceUser: true,
    });
    // 注册隐私授权拦截（全局生效）。注意：不在启动阶段拉取 openid，
    // 避免一进小程序就触发隐私授权弹窗，导致审核员无法直接进入体验广告。
    this.initPrivacy();
  },

  // 隐私保护合规：拦截隐私接口调用，弹窗让用户授权后再继续（全局生效）
  initPrivacy() {
    if (typeof (wx as any).onNeedPrivacyAuthorize !== 'function') return; // 低版本基础库兼容
    (wx as any).onNeedPrivacyAuthorize((resolve: any, event: any) => {
      wx.showModal({
        title: '隐私保护指引',
        content:
          '感谢使用本工具。我们使用你的微信 OpenID 仅用于标识账号与记录你提交的内容；' +
          '你填写的反馈、游戏记录等仅保存在你授权的云端，不会用于其他用途。' +
          '使用前请阅读并同意《隐私保护指引》。',
        confirmText: '同意并继续',
        cancelText: '暂不使用',
        success: (res) => {
          // 必须回调 resolve，否则隐私接口会一直被挂起
          resolve({ allow: res.confirm, event });
        },
      });
    });
  },

  // 懒加载登录：仅在真正需要 openid/昵称时调用（如提交反馈），复用同一次结果
  ensureLogin(): Promise<void> {
    if (this.globalData.userInfo) return Promise.resolve();
    if (!loginPromise) {
      loginPromise = this.autoLogin();
    }
    return loginPromise!;
  },

  autoLogin(): Promise<void> {
    return new Promise((resolve) => {
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
          resolve();
        },
        fail: (err: any) => {
          console.error('[云函数调用失败]', err);
          resolve();
        },
      });
    });
  },
});

// 登录 Promise 缓存（模块级，避免重复调用云函数）
let loginPromise: Promise<void> | null = null;
