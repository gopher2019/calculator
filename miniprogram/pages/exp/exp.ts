// exp.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

// 等级 N 升级到 N+1 所需经验（索引为等级，1~119）
const EXP_TABLE: Record<number, number> = {
  1: 90, 2: 324, 3: 630, 4: 1152, 5: 1620, 6: 1800, 7: 1980, 8: 2160, 9: 2340, 10: 6300,
  11: 7020, 12: 7776, 13: 8874, 14: 10044, 15: 11628, 16: 13320, 17: 15498, 18: 18216, 19: 21528, 20: 25488,
  21: 30150, 22: 35568, 23: 41796, 24: 48888, 25: 57420, 26: 67500, 27: 78678, 28: 91008, 29: 104544, 30: 123624,
  31: 144270, 32: 155466, 33: 190476, 34: 216144, 35: 243594, 36: 272880, 37: 304056, 38: 337176, 39: 372294, 40: 409860,
  41: 449955, 42: 492660, 43: 530140, 44: 586224, 45: 637245, 46: 691200, 47: 748170, 48: 808236, 49: 870000, 50: 937980,
  51: 1007820, 52: 1081080, 53: 1157841, 54: 1238148, 55: 1322190, 56: 1409940, 57: 1501515, 58: 1596996, 59: 1696400, 60: 18000000,
  61: 1907685, 62: 20100000, 63: 2135826, 64: 2256444, 65: 2381535, 66: 2516850, 67: 2667825, 68: 2835000, 69: 3018915, 70: 3220110,
  71: 3439125, 72: 3676500, 73: 3921234, 74: 4208490, 75: 4518405, 76: 4863600, 77: 5200000, 78: 5664150, 79: 6121665, 80: 6739740,
  81: 7676775, 82: 9098370, 83: 11177325, 84: 14093640, 85: 18034515, 86: 23194350, 87: 29774945, 88: 37984500, 89: 48039615, 90: 60163290,
  91: 74585925, 92: 91545120, 93: 111285675, 94: 134059590, 95: 160126065, 96: 189751500, 97: 223069396, 98: 260134829, 99: 302753565, 100: 307564920,
  101: 312506775, 102: 313758130, 103: 322792785, 104: 328142340, 105: 333633195, 106: 339268050, 107: 345049605, 108: 350980560, 109: 357063615, 110: 363301470,
  111: 369696825, 112: 376252380, 113: 382970835, 114: 389854890, 115: 396907245, 116: 404130600, 117: 411527665, 118: 419101110, 119: 426853665,
};

const MIN_LEVEL = 1;
const MAX_LEVEL = 120; // 目标等级上限（满级119升120语义）

// 分段汇总固定数据（严格使用给定数字，不自行累加）
const SUMMARY_LIST = [
  { range: '1-80级', value: 90626655 },
  { range: '80-90级', value: 205813775 },
  { range: '90-100级', value: 1516848300 },
  { range: '100-110级', value: 3310759975 },
  { range: '110-119级', value: 3513743020 },
];

interface ExpResult {
  total: number;        // 区间完整经验累计和
  remain: number;       // 升级缺口 = total - 已获得本级经验
  curGap: number;       // 当前本级距离升级还差经验
  curLevel: number;
  targetLevel: number;
}

function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

// 预构建单级明细列表（1-2 ... 119-120）
const DETAIL_LIST = (() => {
  const list: { lv: number; range: string; valueText: string }[] = [];
  for (let lv = 1; lv <= 119; lv++) {
    list.push({ lv, range: `${lv}-${lv + 1}`, valueText: formatNum(EXP_TABLE[lv]) });
  }
  return list;
})();

Page({
  ...shareConfig,

  data: {
    activeTab: 0,       // 0:升级计算 1:单级明细 2:分段汇总
    detailList: DETAIL_LIST,
    summaryList: SUMMARY_LIST.map((s) => ({ range: s.range, valueText: formatNum(s.value) })),

    curLevel: '',
    curExp: '0',
    targetLevel: '',
    result: null as (ExpResult & { totalText: string; remainText: string; curGapText: string }) | null,
    showResult: false,
    // 原生模板广告位真实高度（rpx），加载后实测并动态适配
    adReserve: 0,
    // 广告加载失败时隐藏广告位，避免空占位
    adHidden: false,
  },

  onTabChange(e: any) {
    this.setData({ activeTab: Number(e.currentTarget.dataset.index) });
  },

  onLoad() {
    enableShareMenu();
  },

  onCurLevelInput(e: any) {
    this.setData({ curLevel: e.detail.value });
  },

  onCurExpInput(e: any) {
    this.setData({ curExp: e.detail.value });
  },

  onTargetLevelInput(e: any) {
    this.setData({ targetLevel: e.detail.value });
  },

  setTarget(e: any) {
    this.setData({ targetLevel: String(e.currentTarget.dataset.level) });
  },

  onCalculate() {
    const curRaw = (this.data.curLevel ?? '').trim();
    const expRaw = (this.data.curExp ?? '').trim() === '' ? '0' : (this.data.curExp ?? '').trim();
    const tgtRaw = (this.data.targetLevel ?? '').trim();

    if (!/^\d+$/.test(curRaw)) {
      wx.showToast({ title: '当前等级需为1~119正整数', icon: 'none' });
      return;
    }
    const cur = Number(curRaw);
    if (cur < 1 || cur > 119) {
      wx.showToast({ title: '当前等级需在1~119之间', icon: 'none' });
      return;
    }

    if (!/^\d+$/.test(expRaw)) {
      wx.showToast({ title: '已获得经验需为非负整数', icon: 'none' });
      return;
    }
    const curExp = Number(expRaw);
    const curLevelExp = EXP_TABLE[cur];
    if (curExp > curLevelExp) {
      wx.showToast({ title: `本级经验不能超过${curLevelExp}`, icon: 'none' });
      return;
    }

    if (!/^\d+$/.test(tgtRaw)) {
      wx.showToast({ title: '目标等级需为2~120正整数', icon: 'none' });
      return;
    }
    const tgt = Number(tgtRaw);
    if (tgt < 2 || tgt > MAX_LEVEL) {
      wx.showToast({ title: '目标等级需在2~120之间', icon: 'none' });
      return;
    }
    if (tgt <= cur) {
      wx.showToast({ title: '目标等级必须高于当前等级', icon: 'none' });
      return;
    }

    // 1. 累加区间每一级升级经验
    let total = 0;
    for (let lv = cur; lv < tgt; lv++) {
      total += EXP_TABLE[lv] ?? 0;
    }
    // 2. 升级缺口 = 累计 - 已获得本级经验
    const remain = total - curExp;
    // 3. 当前本级距离升级还差
    const curGap = curLevelExp - curExp;

    const result = {
      total,
      remain,
      curGap,
      curLevel: cur,
      targetLevel: tgt,
      totalText: formatNum(total),
      remainText: formatNum(remain),
      curGapText: formatNum(curGap),
    };
    this.setData({ result, showResult: true });
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
  },

  // 原生模板广告加载成功：多次实测、以最终稳定高度为准（广告先占位后收缩），避免预留过高留白
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-slot')
        .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | undefined) => {
          if (!rect || !rect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          const rpx = Math.ceil((rect.height * 750) / winWidth);
          this.setData({ adReserve: rpx });
        })
        .exec();
    };
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：隐藏广告位，避免空占位
  onAdError() {
    this.setData({ adReserve: 0, adHidden: true });
  },
});
