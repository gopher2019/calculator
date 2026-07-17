import {
  calculateBeastAptitude,
  getWuXingRateTable,
  getLingXingRateTable,
  type BeastCalcResult,
} from '../../utils/beastCalc';
import { shareConfig, enableShareMenu } from '../../utils/share';

const LEVEL_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

Page({
  ...shareConfig,

  data: {
    currentAptitude: '',
    currentWuXing: 0,
    currentLingXing: 0,
    currentIsSuperLing: false,
    targetWuXing: 10,
    targetLingXing: 10,
    targetIsSuperLing: false,
    wuXingOptions: LEVEL_OPTIONS.map((v) => ({ label: v + '级', value: v })),
    lingXingOptions: LEVEL_OPTIONS.map((v) => ({ label: v + '级', value: v })),
    result: null as BeastCalcResult | null,
    showResult: false,
    showRateTable: false,
    wuXingRateTable: [] as { level: number; rate: number; rateStr: string }[],
    lingXingRateTable: [] as { level: number; rate: number; rateStr: string }[],
    activeRateTab: 'wuxing' as 'wuxing' | 'lingxing',
  },

  onLoad() {
    enableShareMenu();
    this.setData({
      wuXingRateTable: getWuXingRateTable(),
      lingXingRateTable: getLingXingRateTable(),
    });
  },

  onAptitudeInput(e: any) {
    this.setData({ currentAptitude: e.detail.value });
  },

  onCurrentWuXingChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ currentWuXing: LEVEL_OPTIONS[index] });
  },

  onCurrentLingXingChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ currentLingXing: LEVEL_OPTIONS[index] });
  },

  onTargetWuXingChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ targetWuXing: LEVEL_OPTIONS[index] });
  },

  onTargetLingXingChange(e: any) {
    const index = Number(e.detail.value);
    this.setData({ targetLingXing: LEVEL_OPTIONS[index] });
  },

  onToggleCurrentSuperLing() {
    this.setData({ currentIsSuperLing: !this.data.currentIsSuperLing });
  },

  onToggleTargetSuperLing() {
    this.setData({ targetIsSuperLing: !this.data.targetIsSuperLing });
  },

  onCalculate() {
    const { currentAptitude, currentWuXing, currentLingXing, currentIsSuperLing, targetWuXing, targetLingXing, targetIsSuperLing } = this.data;
    const aptitude = parseFloat(currentAptitude);
    if (isNaN(aptitude) || aptitude <= 0) {
      wx.showToast({ title: '请输入有效的当前资质', icon: 'none' });
      return;
    }
    const result = calculateBeastAptitude({
      currentAptitude: aptitude, currentWuXing, currentLingXing, currentIsSuperLing,
      targetWuXing, targetLingXing, targetIsSuperLing,
    });
    this.setData({ result, showResult: true });
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
  },

  onReset() {
    this.setData({
      currentAptitude: '', currentWuXing: 1, currentLingXing: 1,
      currentIsSuperLing: false, targetWuXing: 10, targetLingXing: 10,
      targetIsSuperLing: false, result: null, showResult: false,
    });
  },

  onToggleRateTable() {
    this.setData({ showRateTable: !this.data.showRateTable });
  },

  onSwitchRateTab(e: any) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeRateTab: tab });
  },
});
