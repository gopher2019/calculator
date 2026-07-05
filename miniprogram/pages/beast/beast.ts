import {
  calculateBeastAptitude,
  getWuXingRateTable,
  getLingXingRateTable,
  type BeastCalcResult,
} from '../../utils/beastCalc';

const LEVEL_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

Component({
  data: {
    // 用户输入
    currentAptitude: '',
    currentWuXing: 1,
    currentLingXing: 1,
    currentIsSuperLing: false,
    targetWuXing: 10,
    targetLingXing: 10,
    targetIsSuperLing: false,

    // 等级选项
    wuXingOptions: LEVEL_OPTIONS.map((v) => ({ label: v + '级', value: v })),
    lingXingOptions: LEVEL_OPTIONS.map((v) => ({ label: v + '级', value: v })),

    // 计算结果
    result: null as BeastCalcResult | null,
    showResult: false,

    // 倍率表
    showRateTable: false,
    wuXingRateTable: [] as { level: number; rate: number; rateStr: string }[],
    lingXingRateTable: [] as { level: number; rate: number; rateStr: string }[],
    activeRateTab: 'wuxing' as 'wuxing' | 'lingxing',
  },

  lifetimes: {
    attached() {
      this.setData({
        wuXingRateTable: getWuXingRateTable(),
        lingXingRateTable: getLingXingRateTable(),
      });
    },
  },

  methods: {
    /** 当前资质输入 */
    onAptitudeInput(e: WechatMiniprogram.Input) {
      this.setData({ currentAptitude: e.detail.value });
    },

    /** 当前悟性选择 */
    onCurrentWuXingChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value);
      this.setData({ currentWuXing: LEVEL_OPTIONS[index] });
    },

    /** 当前灵性选择 */
    onCurrentLingXingChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value);
      this.setData({ currentLingXing: LEVEL_OPTIONS[index] });
    },

    /** 目标悟性选择 */
    onTargetWuXingChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value);
      this.setData({ targetWuXing: LEVEL_OPTIONS[index] });
    },

    /** 目标灵性选择 */
    onTargetLingXingChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value);
      this.setData({ targetLingXing: LEVEL_OPTIONS[index] });
    },

    /** 切换当前超灵 */
    onToggleCurrentSuperLing() {
      this.setData({ currentIsSuperLing: !this.data.currentIsSuperLing });
    },

    /** 切换目标超灵 */
    onToggleTargetSuperLing() {
      this.setData({ targetIsSuperLing: !this.data.targetIsSuperLing });
    },

    /** 执行计算 */
    onCalculate() {
      const {
        currentAptitude,
        currentWuXing,
        currentLingXing,
        currentIsSuperLing,
        targetWuXing,
        targetLingXing,
        targetIsSuperLing,
      } = this.data;

      const aptitude = parseFloat(currentAptitude);
      if (isNaN(aptitude) || aptitude <= 0) {
        wx.showToast({ title: '请输入有效的当前资质', icon: 'none' });
        return;
      }

      const result = calculateBeastAptitude({
        currentAptitude: aptitude,
        currentWuXing,
        currentLingXing,
        currentIsSuperLing,
        targetWuXing,
        targetLingXing,
        targetIsSuperLing,
      });

      this.setData({ result, showResult: true });

      // 滚动到结果区域
      wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
    },

    /** 重置 */
    onReset() {
      this.setData({
        currentAptitude: '',
        currentWuXing: 1,
        currentLingXing: 1,
        currentIsSuperLing: false,
        targetWuXing: 10,
        targetLingXing: 10,
        targetIsSuperLing: false,
        result: null,
        showResult: false,
      });
    },

    /** 切换倍率表显示 */
    onToggleRateTable() {
      this.setData({ showRateTable: !this.data.showRateTable });
    },

    /** 切换倍率表tab */
    onSwitchRateTab(e: WechatMiniprogram.TouchEvent) {
      const tab = e.currentTarget.dataset.tab;
      this.setData({ activeRateTab: tab });
    },
  },
});
