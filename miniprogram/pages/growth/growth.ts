import {
  calculateGrowthRate,
  getCarryLevelOptions,
  getGrowthReferenceTable,
  type GrowthCalcResult,
} from '../../utils/growthCalc';
import { shareConfig, enableShareMenu } from '../../utils/share';

interface GrowthRefRow {
  carryLevel: number; label: string; normal: string;
  excellent: string; outstanding: string; epic: string; perfect: string;
}

Page({
  ...shareConfig,

  data: {
    carryLevel: 95,
    vitAptitude: '',
    currentLevel: '',
    currentHp: '',
    vitPoints: '',
    carryLevelOptions: [] as { label: string; value: number }[],
    result: null as GrowthCalcResult | null,
    showResult: false,
    showRefTable: false,
    refTable: [] as GrowthRefRow[],
    // 顶部原生模板广告位真实高度（rpx），加载后实测并动态适配
    adReserveTop: 0,
    // 顶部广告加载失败时隐藏广告位，避免空占位
    adHiddenTop: false,
    // 成长率参考表上方广告位高度，加载后实测并动态适配
    adReserveMid: 0,
    // 中部广告加载失败时隐藏，避免空占位
    adHiddenMid: false,
  },

  onLoad() {
    enableShareMenu();
    this.setData({
      carryLevelOptions: getCarryLevelOptions(),
      refTable: getGrowthReferenceTable(),
    });
  },

  onCarryLevelChange(e: any) {
    const index = Number(e.detail.value);
    const options = this.data.carryLevelOptions;
    this.setData({ carryLevel: options[index].value });
  },

  onVitAptitudeInput(e: any) { this.setData({ vitAptitude: e.detail.value }); },
  onCurrentLevelInput(e: any) { this.setData({ currentLevel: e.detail.value }); },
  onCurrentHpInput(e: any) { this.setData({ currentHp: e.detail.value }); },
  onVitPointsInput(e: any) { this.setData({ vitPoints: e.detail.value }); },

  onCalculate() {
    const { vitAptitude, currentLevel, currentHp, vitPoints, carryLevel } = this.data;
    const aptitude = parseFloat(vitAptitude);
    const level = parseFloat(currentLevel);
    const hp = parseFloat(currentHp);
    const points = parseFloat(vitPoints);

    if (isNaN(aptitude) || aptitude <= 0) { wx.showToast({ title: '请输入有效的体力资质', icon: 'none' }); return; }
    if (isNaN(level) || level <= 0) { wx.showToast({ title: '请输入有效的当前等级', icon: 'none' }); return; }
    if (isNaN(hp) || hp <= 0) { wx.showToast({ title: '请输入有效的当前血量', icon: 'none' }); return; }
    if (isNaN(points) || points < 0) { wx.showToast({ title: '请输入有效的体力点数', icon: 'none' }); return; }

    const result = calculateGrowthRate({
      carryLevel, vitAptitude: aptitude, currentLevel: level,
      currentHp: hp, vitPoints: points,
    });

    if (!result) {
      wx.showModal({
        title: '无法匹配成长率',
        content: '请检查体力资质、体力点数、血量是否填写正确。\n\n必须是0悟性0灵性裸资、脱掉宝宝套无迟钝的原生血量。',
        showCancel: false,
      });
      return;
    }

    this.setData({ result, showResult: true });
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
  },

  onReset() {
    this.setData({
      vitAptitude: '', currentLevel: '', currentHp: '', vitPoints: '',
      result: null, showResult: false,
    });
  },

  onToggleRefTable() {
    this.setData({ showRefTable: !this.data.showRefTable });
  },

  // 原生模板广告加载成功：多次实测、以最终稳定高度为准（广告先占位后收缩），避免预留过高留白
  onAdLoad(e: any) {
    const slot = e.currentTarget.dataset.slot === 'mid' ? 'mid' : 'top';
    const reserveKey = slot === 'mid' ? 'adReserveMid' : 'adReserveTop';
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-slot-' + slot)
        .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | undefined) => {
          if (!rect || !rect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          const rpx = Math.ceil((rect.height * 750) / winWidth);
          this.setData({ [reserveKey]: rpx });
        })
        .exec();
    };
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：隐藏对应广告位，避免空占位
  onAdError(e: any) {
    const slot = e.currentTarget.dataset.slot === 'mid' ? 'mid' : 'top';
    if (slot === 'mid') {
      this.setData({ adReserveMid: 0, adHiddenMid: true });
    } else {
      this.setData({ adReserveTop: 0, adHiddenTop: true });
    }
  },
});
