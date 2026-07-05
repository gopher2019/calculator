import {
  calculateGrowthRate,
  getCarryLevelOptions,
  getGrowthReferenceTable,
  type GrowthCalcResult,
} from '../../utils/growthCalc';

interface GrowthRefRow {
  carryLevel: number;
  label: string;
  normal: string;
  excellent: string;
  outstanding: string;
  epic: string;
  perfect: string;
}

Component({
  data: {
    // 用户输入
    carryLevel: 5,
    vitAptitude: '',
    currentLevel: '',
    currentHp: '',
    vitPoints: '',

    // 携带等级选项
    carryLevelOptions: [] as { label: string; value: number }[],

    // 计算结果
    result: null as GrowthCalcResult | null,
    showResult: false,

    // 参考表
    showRefTable: false,
    refTable: [] as GrowthRefRow[],
  },

  lifetimes: {
    attached() {
      this.setData({
        carryLevelOptions: getCarryLevelOptions(),
        refTable: getGrowthReferenceTable(),
      });
    },
  },

  methods: {
    /** 携带等级选择 */
    onCarryLevelChange(e: WechatMiniprogram.PickerChange) {
      const index = Number(e.detail.value);
      const options = this.data.carryLevelOptions;
      this.setData({ carryLevel: options[index].value });
    },

    /** 体力资质输入 */
    onVitAptitudeInput(e: WechatMiniprogram.Input) {
      this.setData({ vitAptitude: e.detail.value });
    },

    /** 当前等级输入 */
    onCurrentLevelInput(e: WechatMiniprogram.Input) {
      this.setData({ currentLevel: e.detail.value });
    },

    /** 当前血量输入 */
    onCurrentHpInput(e: WechatMiniprogram.Input) {
      this.setData({ currentHp: e.detail.value });
    },

    /** 体力点数输入 */
    onVitPointsInput(e: WechatMiniprogram.Input) {
      this.setData({ vitPoints: e.detail.value });
    },

    /** 执行计算 */
    onCalculate() {
      const { vitAptitude, currentLevel, currentHp, vitPoints, carryLevel } = this.data;

      const aptitude = parseFloat(vitAptitude);
      const level = parseFloat(currentLevel);
      const hp = parseFloat(currentHp);
      const points = parseFloat(vitPoints);

      if (isNaN(aptitude) || aptitude <= 0) {
        wx.showToast({ title: '请输入有效的体力资质', icon: 'none' });
        return;
      }
      if (isNaN(level) || level <= 0) {
        wx.showToast({ title: '请输入有效的当前等级', icon: 'none' });
        return;
      }
      if (isNaN(hp) || hp <= 0) {
        wx.showToast({ title: '请输入有效的当前血量', icon: 'none' });
        return;
      }
      if (isNaN(points) || points < 0) {
        wx.showToast({ title: '请输入有效的体力点数', icon: 'none' });
        return;
      }

      const result = calculateGrowthRate({
        carryLevel,
        vitAptitude: aptitude,
        currentLevel: level,
        currentHp: hp,
        vitPoints: points,
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

    /** 重置 */
    onReset() {
      this.setData({
        vitAptitude: '',
        currentLevel: '',
        currentHp: '',
        vitPoints: '',
        result: null,
        showResult: false,
      });
    },

    /** 切换参考表 */
    onToggleRefTable() {
      this.setData({ showRefTable: !this.data.showRefTable });
    },
  },
});
