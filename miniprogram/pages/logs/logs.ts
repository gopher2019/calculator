import { formatTime } from '../../utils/util';
import { shareConfig, enableShareMenu } from '../../utils/share';

Page({
  onShareAppMessage() {
    return {
      title: '墨狐小算器｜启动日志｜天龙怀旧服工具',
      path: 'pages/logs/logs',
      desc: '天龙八部怀旧服实用工具-墨狐小算器，包含攻略、点位、计算器，方便带队刷本、防骗、材料收购计算等。'
    };
  },

  ...shareConfig,

  data: {
    logs: [] as { date: string; timeStamp: string }[],
  },

  onLoad() {
    enableShareMenu();
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log: string) => ({
        date: formatTime(new Date(log)),
        timeStamp: log,
      })),
    });
  },
});
