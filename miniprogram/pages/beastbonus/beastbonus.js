// beastbonus.js
// 兽魂附体资质表：纯静态前端，数据全部写在前端，无后端接口
// 纵向展示的资质项目（行），顺序：等级 → 各资质数值
const METRICS = [
  { key: '等级', label: '等级' },
  { key: '最终资质', label: '最终资质' },
  { key: '满神兽双10(30%)', label: '满神兽双10(30%)' },
  { key: '原始资质超灵·神兽', label: '原始资质超灵·神兽' },
  { key: '原始资质非超灵·神兽', label: '原始资质非超灵·神兽' },
  { key: '满荒兽双10(20%)', label: '满荒兽双10(20%)' },
  { key: '原始资质超灵·荒兽', label: '原始资质超灵·荒兽' },
  { key: '原始资质非超灵·荒兽', label: '原始资质非超灵·荒兽' }
];

const DATA_1_2 = [
  { rid: 'a1', '加成类别': '命中+会心+会防+闪避+身法', '等级': '85', '最终资质': '5450', '满神兽双10(30%)': '4193', '原始资质超灵·神兽': '2247', '原始资质非超灵·神兽': '2298', '满荒兽双10(20%)': '4542', '原始资质超灵·荒兽': '2434', '原始资质非超灵·荒兽': '2489' },
  { rid: 'a2', '加成类别': '命中+会心+会防+闪避+身法', '等级': '95', '最终资质': '5000', '满神兽双10(30%)': '3847', '原始资质超灵·神兽': '2061', '原始资质非超灵·神兽': '2109', '满荒兽双10(20%)': '4167', '原始资质超灵·荒兽': '2233', '原始资质非超灵·荒兽': '2284' },
  { rid: 'a3', '加成类别': '血上限+体力+力灵定+内外功+增减伤+抗性+抗控制', '等级': '85', '最终资质': '7500', '满神兽双10(30%)': '5770', '原始资质超灵·神兽': '3092', '原始资质非超灵·神兽': '3162', '满荒兽双10(20%)': '6250', '原始资质超灵·荒兽': '3349', '原始资质非超灵·荒兽': '3425' },
  { rid: 'a4', '加成类别': '血上限+体力+力灵定+内外功+增减伤+抗性+抗控制', '等级': '95', '最终资质': '6730', '满神兽双10(30%)': '5177', '原始资质超灵·神兽': '2774', '原始资质非超灵·神兽': '2837', '满荒兽双10(20%)': '5609', '原始资质超灵·荒兽': '3005', '原始资质非超灵·荒兽': '3074' }
];

const DATA_1 = [
  { rid: 'a1', '加成类别': '命中+会心+会防+闪避+身法', '等级': '85', '最终资质': '4900', '满神兽双10(30%)': '3770', '原始资质超灵·神兽': '2020', '原始资质非超灵·神兽': '2066', '满荒兽双10(20%)': '4084', '原始资质超灵·荒兽': '2188', '原始资质非超灵·荒兽': '2239' },
  { rid: 'a2', '加成类别': '命中+会心+会防+闪避+身法', '等级': '95', '最终资质': '4500', '满神兽双10(30%)': '3462', '原始资质超灵·神兽': '1855', '原始资质非超灵·神兽': '1898', '满荒兽双10(20%)': '3750', '原始资质超灵·荒兽': '2009', '原始资质非超灵·荒兽': '2055' },
  { rid: 'a3', '加成类别': '血上限+体力+力灵定+内外功+增减伤+抗性+抗控制', '等级': '85', '最终资质': '6600', '满神兽双10(30%)': '5077', '原始资质超灵·神兽': '2720', '原始资质非超灵·神兽': '2783', '满荒兽双10(20%)': '5500', '原始资质超灵·荒兽': '2947', '原始资质非超灵·荒兽': '3014' },
  { rid: 'a4', '加成类别': '血上限+体力+力灵定+内外功+增减伤+抗性+抗控制', '等级': '95', '最终资质': '6000', '满神兽双10(30%)': '4616', '原始资质超灵·神兽': '2473', '原始资质非超灵·神兽': '2530', '满荒兽双10(20%)': '5000', '原始资质超灵·荒兽': '2679', '原始资质非超灵·荒兽': '2740' }
];

Page({
  data: {
    metrics: METRICS,
    rateOptions: ['1倍', '1.2倍'],
    rateIndex: 0, // 默认第一个：1倍
    catOptions: ['命中+会心+会防+闪避+身法', '血上限+体力+力灵定+内外功+增减伤+抗性+抗控制'],
    catIndex: 0, // 默认第一个：命中类
    levelOptions: ['85', '95'],
    levelIndex: 0, // 默认第一个：85
    allCols: [],
    combo: { cat: '', lv: '' }, // 当前选中的组合（卡片标题用）
    rows: [], // 当前组合的各指标（label/value），卡片逐行展示
    showHelp: false,
    // 底部悬浮广告位高度（rpx），加载后实测并动态适配，避免遮挡内容或留白
    adReserve: 180,
    // 广告加载失败时隐藏广告位，避免空占位
    adHidden: false,
  },

  onLoad() {
    this.applyRate(this.data.rateIndex);
  },

  // 把原始数据（含中文键）转成 WXML 友好的结构：加成类别/等级用 ASCII 键，
  // 其余指标值保留在 data 中，按 m.key（ASCII 变量）取值，避免表达式里出现中文
  applyRate(index) {
    const raw = index === 1 ? DATA_1_2 : DATA_1;
    const allCols = raw.map((it) => ({
      rid: it.rid,
      cat: it['加成类别'],
      lv: it['等级'],
      data: it,
    }));
    this.setData({ rateIndex: index, allCols });
    this.applyFilter();
  },

  // 三个筛选项都必选（无“全部”）：倍率选数据集，资质项目+等级唯一锁定一个组合
  // 该组合以「指标名：数值」卡片逐行展示（形式同强化加成页）
  applyFilter() {
    const { allCols, catIndex, levelIndex, catOptions, levelOptions, metrics } = this.data;
    const cat = catOptions[catIndex];
    const lv = levelOptions[levelIndex];
    const matched = allCols.filter((c) => c.cat === cat && c.lv === lv);
    const combo = matched[0] || { cat: '', lv: '', data: {} };
    const rows = metrics.map((m) => ({ label: m.label, value: combo.data[m.key] }));
    this.setData({ combo, rows });
  },

  // 下拉切换加成倍率
  onRateChange(e) {
    const index = Number(e.detail.value);
    if (index === this.data.rateIndex) return;
    this.applyRate(index);
  },

  // 下拉筛选资质项目（加成类别）
  onCatChange(e) {
    const index = Number(e.detail.value);
    if (index === this.data.catIndex) return;
    this.setData({ catIndex: index });
    this.applyFilter();
  },

  // 下拉筛选等级
  onLevelChange(e) {
    const index = Number(e.detail.value);
    if (index === this.data.levelIndex) return;
    this.setData({ levelIndex: index });
    this.applyFilter();
  },

  openHelp() {
    this.setData({ showHelp: true });
  },

  closeHelp() {
    this.setData({ showHelp: false });
  },

  // 阻止点击弹窗内容时关闭弹窗
  noop() {},

  // 原生模板广告加载成功：多次实测、以最终稳定高度为准（广告先占位后收缩），避免预留过高留白
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-card')
        .boundingClientRect((rect) => {
          if (!rect || !rect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          const rpx = Math.ceil((rect.height * 750) / winWidth) + 24;
          this.setData({ adReserve: rpx });
        })
        .exec();
    };
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：隐藏广告位并收回预留空间，避免空占位
  onAdError() {
    this.setData({ adReserve: 0, adHidden: true });
  },
});
