// index.ts
Component({
  data: {},
  methods: {
    goToBeastCalc() {
      wx.navigateTo({
        url: '../beast/beast',
      });
    },
    goToGrowthCalc() {
      wx.navigateTo({
        url: '../growth/growth',
      });
    },
  },
});
