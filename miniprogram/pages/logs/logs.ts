import { formatTime } from '../../utils/util';

Page({
  data: {
    logs: [] as { date: string; timeStamp: string }[],
  },

  onLoad() {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map((log: string) => ({
        date: formatTime(new Date(log)),
        timeStamp: log,
      })),
    });
  },
});
