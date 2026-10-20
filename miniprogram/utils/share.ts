// 分享能力通用配置
// 分享给好友依赖 onShareAppMessage，分享到朋友圈依赖 onShareTimeline。
// 同时在页面 onLoad 中调用 enableShareMenu() 确保右上角菜单同时显示两个入口。

const SHARE_TITLE = '墨狐小算器 - 游戏数值计算小工具';

// 返回分享配置对象，可直接通过 ...shareConfig 展开到任意 Page 的参数中
// 注意：各页面已在自身 Page 参数中定义 onShareAppMessage（含逐页标题与描述），
// 为避免 ...shareConfig 展开后覆盖页面自定义的分享标题，这里仅保留 onShareTimeline。
export const shareConfig = {
  onShareTimeline() {
    return {
      title: SHARE_TITLE,
    };
  },
};

// 在页面 onLoad 中调用，开启右上角"发送给朋友"与"分享到朋友圈"菜单
export function enableShareMenu() {
  wx.showShareMenu({
    withShareTicket: false,
    menus: ['shareAppMessage', 'shareTimeline'],
  });
}
