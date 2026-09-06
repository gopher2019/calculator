// wuhun.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

/** 核心计算函数（三类属性共用同一公式）：
 * 最终值 = Ceil( 各项属性标准值 × 武魂合成等级加成系数 × (武魂成长率 ÷ 1000) )
 * 只要小数大于0，全部向上进位取整（如 18.01 → 19；整数无小数保留原值）。
 */
export function calcWuHunExt(standard: number, synthCoeff: number, growth: number): number {
  return Math.ceil(standard * synthCoeff * (growth / 1000));
}

// 合成等级系数 A（三类属性共用，倒序 7,6,5）
const SYNTH_LEVELS = [7, 6, 5];
const SYNTH_COEFF: Record<number, number> = {
  7: 1.45,
  6: 1.35,
  5: 1.25,
};

// 扩展属性等级（三类属性共用同一等级维度，倒序 8→1）
const EXT_LEVELS = [8, 7, 6, 5, 4, 3, 2, 1];

// ① 属性攻击标准值 B（用于【属性值】）
const ATK_COEFF: Record<number, number> = {
  1: 30, 2: 41, 3: 63, 4: 93, 5: 131, 6: 174, 7: 223, 8: 277,
};
// ② 抗性/减抗标准值 B（御、破共用，用于【属性(减)抗值】）
const RES_COEFF: Record<number, number> = {
  1: 5, 2: 11, 3: 16, 4: 24, 5: 33, 6: 44, 7: 56, 8: 70,
};
// ③ 减抗下限标准值 B（用于【减抗下限值】）
const FLOOR_COEFF: Record<number, number> = {
  1: 2, 2: 3, 3: 4, 4: 5, 5: 7, 6: 9, 7: 12, 8: 14,
};

const GROWTH_MIN = 600;
const GROWTH_MAX = 900;

interface WuHunResult {
  atk: number;       // 属性值
  resist: number;    // 属性(减)抗值
  floor: number;     // 减抗下限值
}

Page({
  ...shareConfig,

  data: {
    synthLevels: SYNTH_LEVELS,
    extLevels: EXT_LEVELS,
    synthIndex: 0,   // 默认合成等级 7
    extIndex: 0,     // 默认扩展属性等级 8
    growth: '',
    result: null as WuHunResult | null,
    showResult: false,
    // 底部悬浮广告位高度（rpx），加载后实测并动态适配，避免遮挡内容或留白
    adReserve: 180,
    // 广告加载失败时隐藏广告位，避免空占位
    adHidden: false,
  },

  onLoad() {
    enableShareMenu();
  },

  onSynthChange(e: any) {
    this.setData({ synthIndex: e.detail.value });
  },

  onExtChange(e: any) {
    this.setData({ extIndex: e.detail.value });
  },

  onGrowthInput(e: any) {
    this.setData({ growth: e.detail.value });
  },

  onCalculate() {
    const synthLevel = this.data.synthLevels[this.data.synthIndex];
    const extLevel = this.data.extLevels[this.data.extIndex];
    const coeffA = SYNTH_COEFF[synthLevel];
    const atkB = ATK_COEFF[extLevel];
    const resB = RES_COEFF[extLevel];
    const floorB = FLOOR_COEFF[extLevel];

    const raw = (this.data.growth ?? '').trim();
    if (raw === '') {
      wx.showToast({ title: '请输入武魂成长率', icon: 'none' });
      return;
    }
    if (!/^\d+(\.\d+)?$/.test(raw)) {
      wx.showToast({ title: '成长率需为数字', icon: 'none' });
      return;
    }
    const growth = Number(raw);
    if (growth < GROWTH_MIN || growth > GROWTH_MAX) {
      wx.showToast({ title: `成长率需在${GROWTH_MIN}~${GROWTH_MAX}之间`, icon: 'none' });
      return;
    }

    const result: WuHunResult = {
      atk: calcWuHunExt(atkB, coeffA, growth),
      resist: calcWuHunExt(resB, coeffA, growth),
      floor: calcWuHunExt(floorB, coeffA, growth),
    };
    this.setData({ result, showResult: true });
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
  },

  // 原生模板广告加载成功：多次实测、以最终稳定高度为准（广告先占位后收缩），避免预留过高留白
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-card')
        .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | undefined) => {
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
