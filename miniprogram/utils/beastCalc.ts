/**
 * 资质计算器核心逻辑
 *
 * 悟性等级对应倍率表（第一列）
 * 灵性等级对应倍率表（第二列/第三列）
 *
 * 计算原理：
 * - 当前资质 / 当前悟性倍率 = 基础资质
 * - 基础资质 * 目标悟性倍率 = 目标悟性资质
 * - 同理可计算灵性加成
 */

// 悟性等级倍率表（第一列）
const WU_XING_RATES: number[] = [
  0,      // 等级0，占位
  1.0100, // 等级1: 101%
  1.0150, // 等级2: 101.50%
  1.0210, // 等级3: 102.10%
  1.0300, // 等级4: 103%
  1.0800, // 等级5: 108%
  1.1100, // 等级6: 111%
  1.1450, // 等级7: 114.50%
  1.2350, // 等级8: 123.50%
  1.3000, // 等级9: 130%
  1.3930, // 等级10: 139.30%
];

// 灵性等级倍率表（第二列）
const LING_XING_RATES: number[] = [
  0,      // 等级0，占位
  1.0100, // 等级1: 101%
  1.0200, // 等级2: 102%
  1.0500, // 等级3: 105%
  1.0700, // 等级4: 107%
  1.1100, // 等级5: 111%
  1.1400, // 等级6: 114%
  1.1800, // 等级7: 118%
  1.2200, // 等级8: 122%
  1.2600, // 等级9: 126%
  1.3100, // 等级10: 131%
];

// 灵性超灵倍率表（仅 8/9/10 级区分超灵，1-7 级与普通灵性一致）
const SUPER_LING_RATES: number[] = [
  0,      // 等级0，占位
  1.0100, // 等级1: 101%（与普通一致）
  1.0200, // 等级2: 102%
  1.0500, // 等级3: 105%
  1.0700, // 等级4: 107%
  1.1100, // 等级5: 111%
  1.1400, // 等级6: 114%
  1.1800, // 等级7: 118%
  1.2400, // 等级8: 124%（超灵+24.0%）
  1.2800, // 等级9: 128%（超灵+28.0%）
  1.3400, // 等级10: 134%（超灵）
];

export interface BeastCalcInput {
  currentAptitude: number;    // 当前资质
  currentWuXing: number;      // 当前悟性等级 (0-10)
  currentLingXing: number;    // 当前灵性等级 (0-10)
  currentIsSuperLing: boolean;// 当前是否超灵
  targetWuXing: number;       // 目标悟性等级 (0-10)
  targetLingXing: number;     // 目标灵性等级 (0-10)
  targetIsSuperLing: boolean; // 目标是否超灵
}

export interface BeastCalcResult {
  baseAptitude: number;            // 基础资质（去除所有加成）
  targetAptitude: number;          // 目标资质
  currentWuXingRate: number;       // 当前悟性倍率
  currentLingXingRate: number;     // 当前灵性倍率
  targetWuXingRate: number;        // 目标悟性倍率
  targetLingXingRate: number;      // 目标灵性倍率
  aptitudeGain: number;            // 资质提升值
  // 预格式化字符串（供 wxml 直接使用）
  totalCurrentRateStr: string;     // 当前总倍率
  wuXingRateChangeStr: string;     // 悟性倍率变化
  lingXingRateChangeStr: string;   // 灵性倍率变化
  aptitudeGainStr: string;         // 资质提升（带+号）
}

/**
 * 获取悟性倍率
 */
export function getWuXingRate(level: number): number {
  if (level < 1 || level > 10) return 1;
  return WU_XING_RATES[level];
}

/**
 * 获取灵性倍率
 * @param level 灵性等级 (0-10)
 * @param isSuperLing 是否超灵（仅 level=8/9/10 时生效；8级124%、9级128%、10级134%，普通分别为122%/126%/131%）
 */
export function getLingXingRate(level: number, isSuperLing: boolean = false): number {
  if (level < 1 || level > 10) return 1;
  return isSuperLing ? SUPER_LING_RATES[level] : LING_XING_RATES[level];
}

/**
 * 计算资质
 *
 * 计算公式：
 * 1. 基础资质 = 当前资质 / (当前悟性倍率 * 当前灵性倍率)
 * 2. 目标资质 = 基础资质 * 目标悟性倍率 * 目标灵性倍率
 */
export function calculateBeastAptitude(input: BeastCalcInput): BeastCalcResult {
  const currentWuXingRate = getWuXingRate(input.currentWuXing);
  const currentLingXingRate = getLingXingRate(input.currentLingXing, input.currentIsSuperLing);
  const targetWuXingRate = getWuXingRate(input.targetWuXing);
  const targetLingXingRate = getLingXingRate(input.targetLingXing, input.targetIsSuperLing);

  // 基础资质 = 当前资质 / 当前总倍率
  const totalCurrentRate = currentWuXingRate * currentLingXingRate;
  const baseAptitude = input.currentAptitude / totalCurrentRate;

  // 目标资质 = 基础资质 * 目标总倍率
  const totalTargetRate = targetWuXingRate * targetLingXingRate;
  const targetAptitude = baseAptitude * totalTargetRate;

  const aptitudeGain = targetAptitude - input.currentAptitude;

  const totalCurrentRateStr = (totalCurrentRate * 100).toFixed(2) + '%';
  const wuXingRateChangeStr =
    (currentWuXingRate * 100).toFixed(2) + '% → ' + (targetWuXingRate * 100).toFixed(2) + '%';
  const lingXingRateChangeStr =
    (currentLingXingRate * 100).toFixed(2) + '% → ' + (targetLingXingRate * 100).toFixed(2) + '%';
  const roundedGain = Math.round(aptitudeGain * 100) / 100;
  const aptitudeGainStr = (roundedGain >= 0 ? '+' : '') + roundedGain;

  return {
    baseAptitude: Math.round(baseAptitude * 100) / 100,
    targetAptitude: Math.round(targetAptitude * 100) / 100,
    currentWuXingRate,
    currentLingXingRate,
    targetWuXingRate,
    targetLingXingRate,
    aptitudeGain: roundedGain,
    totalCurrentRateStr,
    wuXingRateChangeStr,
    lingXingRateChangeStr,
    aptitudeGainStr,
  };
}

/**
 * 格式化倍率为百分比字符串
 */
export function formatRate(rate: number): string {
  return (rate * 100).toFixed(2) + '%';
}

/**
 * 获取悟性等级倍率表（用于展示）
 */
export function getWuXingRateTable(): { level: number; rate: number; rateStr: string }[] {
  return WU_XING_RATES.slice(1).map((rate, index) => ({
    level: index + 1,
    rate,
    rateStr: formatRate(rate),
  }));
}

/**
 * 获取灵性等级倍率表（用于展示，含普通与超灵两列）
 */
export function getLingXingRateTable(): {
  level: number;
  normalRateStr: string;
  superRateStr: string;
  differ: boolean;
}[] {
  return LING_XING_RATES.slice(1).map((rate, index) => {
    const level = index + 1;
    const superRate = SUPER_LING_RATES[level];
    return {
      level,
      normalRateStr: formatRate(rate),
      superRateStr: formatRate(superRate),
      differ: superRate !== rate,
    };
  });
}
