import { formatTime } from '../../utils/util';
import { shareConfig, enableShareMenu } from '../../utils/share';

Page({
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
