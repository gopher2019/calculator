/**
 * 成长率计算器核心逻辑
 *
 * 游戏内血量公式（先求和，再对最终血量向下取整）：
 *   血量 = floor(44 + growth × level × 0.06 + staminaPoint × staminaZizhi × 0.018)
 *
 * 使用二分逼近法反推成长率，彻底消除取整误差。
 */

// ── 携带等级区间表（按高等级优先排列） ──────────────────────────
// 格式：{ 携带等级, 普通最低, 优秀最低, 杰出最低, 卓越最低, 完美满成长上限 }
interface GrowthRange {
  carryLevel: number;
  label: string;
  normal: number;       // 普通最低（-1 表示无该档位）
  excellent: number;    // 优秀最低
  outstanding: number;  // 杰出最低
  epic: number;         // 卓越最低
  perfect: number;      // 完美满成长上限
}

const GROWTH_RANGES: GrowthRange[] = [
  { carryLevel: 95, label: '95', normal: -1,   excellent: -1,   outstanding: 1677, epic: 1896, perfect: 2188 },
  { carryLevel: 85, label: '85', normal: -1,   excellent: 1492, outstanding: 1560, epic: 1764, perfect: 2035 },
  { carryLevel: 75, label: '75', normal: 1255, excellent: 1318, outstanding: 1443, epic: 1631, perfect: 1882 },
  { carryLevel: 65, label: '65', normal: 1153, excellent: 1268, outstanding: 1325, epic: 1498, perfect: 1729 },
  { carryLevel: 55, label: '55', normal: 1051, excellent: 1156, outstanding: 1208, epic: 1287, perfect: 1576 },
  { carryLevel: 45, label: '45', normal: 948,  excellent: 1042, outstanding: 1090, epic: 1232, perfect: 1422 },
  { carryLevel: 5,  label: '5（鳄鱼）', normal: 846, excellent: 930, outstanding: 972, epic: 1099, perfect: 1269 },
];

// 各携带等级对应的成长数值范围（二分搜索边界）
// min 设为 1 保证能搜到任何实际成长值，max 为完美满成长上限
const GROWTH_BOUNDS: Record<number, { min: number; max: number }> = {
  5:  { min: 1,    max: 1269 },
  45: { min: 1,    max: 1422 },
  55: { min: 1,    max: 1576 },
  65: { min: 1,    max: 1729 },
  75: { min: 1,    max: 1882 },
  85: { min: 1,    max: 2035 },
  95: { min: 1,    max: 2188 },
};

// ── 类型定义 ────────────────────────────────────────────────────
export type GrowthType = '普通' | '优秀' | '杰出' | '卓越' | '完美' | '未知';

export interface GrowthCalcInput {
  carryLevel: number;   // 携带等级
  vitAptitude: number;  // 体力资质
  currentLevel: number; // 当前等级
  currentHp: number;    // 当前血量
  vitPoints: number;    // 体力点数
}

export interface GrowthCalcResult {
  growthRate: number;           // 精确成长率（二分得出的真实值）
  growthRateRounded: number;    // 四舍五入后的成长率
  growthType: GrowthType;       // 成长率类别（普通/优秀/杰出/卓越/完美）
  rangeMin: number;             // 所属区间下限
  rangeMax: number;             // 所属区间上限
  progressPercent: number;      // 在所属区间内的进度百分比（用于可视化）
  rangeLabel: string;           // 区间标签，如"完美 (2035+)"
  // 预格式化字符串
  growthRateStr: string;
  growthTypeStr: string;
  progressStr: string;
}

// ── 核心函数：模拟游戏内血量计算 ──────────────────────────────

/**
 * 严格按照游戏规则计算血量
 * 公式：血量 = 44 + floor(growth × level × 0.06) + floor(staminaPoint × staminaZizhi × 0.018)
 * 两段分别向下取整（floor），与游戏内完全一致
 *
 * @param growth        成长率
 * @param level         当前等级
 * @param staminaPoint  体力点数
 * @param staminaZizhi  体力资质
 * @returns 游戏内应显示的血量
 */
export function calcGameHp(
  growth: number,
  level: number,
  staminaPoint: number,
  staminaZizhi: number,
): number {
  // 先按游戏公式求完整和，再对最终血量向下取整，
  // 与游戏内显示一致（避免分别对两项取整造成的 1 点偏差）
  return Math.floor(44 + growth * level * 0.06 + staminaPoint * staminaZizhi * 0.018);
}

// ── 二分逼近算法：反推真实成长率 ──────────────────────────────

/**
 * 二分法反推成长率（整数遍历 + 二分加速）
 *
 * 游戏成长率为整数，由于 floor 取整，连续多个整数成长值可能映射到同一血量。
 * 规则：若匹配值集合中包含该携带等级的满成长上限，返回满成长；
 *       否则返回最小匹配值。
 *
 * 先用二分找到任意一个匹配值，然后在该匹配值左侧线性扫描找最小值，
 * 再检查区间上限是否也匹配。
 *
 * @param targetHp      目标血量（游戏面板显示的血量）
 * @param level         当前等级
 * @param staminaPoint  体力点数
 * @param staminaZizhi  体力资质（裸资，0悟性0灵性）
 * @param carryLv       携带等级
 * @returns 真实成长率整数值；若无匹配则返回 -1
 */
export function getRealGrowthByHp(
  targetHp: number,
  level: number,
  staminaPoint: number,
  staminaZizhi: number,
  carryLv: number,
): number {
  const bound = GROWTH_BOUNDS[carryLv];
  if (!bound) {
    return -1;
  }

  let lo = bound.min;
  let hi = bound.max;
  let anyMatch = -1;

  // 二分找到任意一个匹配值
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const simulatedHp = calcGameHp(mid, level, staminaPoint, staminaZizhi);

    if (simulatedHp === targetHp) {
      anyMatch = mid;
      hi = mid - 1; // 向左收缩，找更小的匹配值
    } else if (simulatedHp < targetHp) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  if (anyMatch === -1) {
    return -1;
  }

  // 在 anyMatch 左侧线性扫描确认最小值
  let minGrowth = anyMatch;
  for (let g = anyMatch - 1; g >= bound.min; g--) {
    if (calcGameHp(g, level, staminaPoint, staminaZizhi) === targetHp) {
      minGrowth = g;
    } else {
      break; // floor 函数单调不减，一旦不匹配即可停止
    }
  }

  // 若满成长上限也在匹配集合中，返回满成长（游戏实际成长值）
  if (calcGameHp(bound.max, level, staminaPoint, staminaZizhi) === targetHp) {
    return bound.max;
  }

  return minGrowth;
}

// ── 成长率档次判断 ──────────────────────────────────────────────

/**
 * 根据真实成长率和携带等级判断档次（普通/优秀/杰出/卓越/完美）
 *
 * @param growthRate 真实成长率
 * @param carryLevel 携带等级
 * @returns 档次信息
 */
export function getGrowthTier(
  growthRate: number,
  carryLevel: number,
): {
  growthType: GrowthType;
  rangeMin: number;
  rangeMax: number;
  rangeLabel: string;
  progressPercent: number;
} {
  const rangeInfo = getGrowthRangesByCarryLevel(carryLevel);

  let growthType: GrowthType = '未知';
  let rangeMin = 0;
  let rangeMax = 0;
  let rangeLabel = '';

  if (rangeInfo) {
    // 各列数值是区间上限（闭区间）：
    //   普通: (0, normal]      即 <= normal
    //   优秀: (normal, excellent]      即 > normal && <= excellent
    //   杰出: (excellent, outstanding]  即 > excellent && <= outstanding
    //   卓越: (outstanding, epic]       即 > outstanding && <= epic
    //   完美: (epic, perfect]           即 > epic && <= perfect（满成长=perfect）
    const thresholds: { type: GrowthType; value: number }[] = [
      { type: '普通', value: rangeInfo.normal },
      { type: '优秀', value: rangeInfo.excellent },
      { type: '杰出', value: rangeInfo.outstanding },
      { type: '卓越', value: rangeInfo.epic },
      { type: '完美', value: rangeInfo.perfect },
    ];

    // 从低到高判断，第一个满足 growthRate <= 上限 的即为对应档次
    for (let i = 0; i < thresholds.length; i++) {
      if (thresholds[i].value > 0 && growthRate <= thresholds[i].value) {
        growthType = thresholds[i].type;

        // 区间下限 = 上一档上限 + 1，若无上一档或上一档不存在，下限为 1
        if (i === 0 || thresholds[i - 1].value <= 0) {
          rangeMin = 1;
        } else {
          rangeMin = thresholds[i - 1].value + 1;
        }
        rangeMax = thresholds[i].value;

        rangeLabel = growthType + ' (' + rangeMin + '~' + rangeMax + ')';
        break;
      }
    }
  }

  // 计算区间内进度
  let progressPercent = 0;
  if (rangeMax > rangeMin) {
    progressPercent = ((growthRate - rangeMin) / (rangeMax - rangeMin)) * 100;
    progressPercent = Math.max(0, Math.min(100, progressPercent));
  } else if (growthType === '完美') {
    progressPercent = 100;
  } else if (growthType === '普通') {
    progressPercent = (growthRate / rangeMax) * 100;
  }

  return {
    growthType,
    rangeMin,
    rangeMax,
    rangeLabel,
    progressPercent: Math.round(progressPercent),
  };
}

// ── 对外主计算入口 ──────────────────────────────────────────────

/**
 * 计算成长率（对外统一入口）
 * 先通过二分法反推真实成长率，再判断档次
 *
 * @param input 输入参数
 * @returns 计算结果；若无法匹配返回 null
 */
export function calculateGrowthRate(input: GrowthCalcInput): GrowthCalcResult | null {
  const { carryLevel, vitAptitude, currentLevel, currentHp, vitPoints } = input;

  // 二分法反推真实成长率
  const realGrowth = getRealGrowthByHp(
    currentHp,
    currentLevel,
    vitPoints,
    vitAptitude,
    carryLevel,
  );

  // 无匹配，数据可能有误
  if (realGrowth === -1) {
    return null;
  }

  // 判断档次
  const tier = getGrowthTier(realGrowth, carryLevel);

  return {
    growthRate: realGrowth,
    growthRateRounded: realGrowth,
    growthType: tier.growthType,
    rangeMin: tier.rangeMin,
    rangeMax: tier.rangeMax,
    progressPercent: tier.progressPercent,
    rangeLabel: tier.rangeLabel,
    growthRateStr: String(realGrowth),
    growthTypeStr: tier.growthType,
    progressStr: tier.progressPercent + '%',
  };
}

// ── 工具函数 ────────────────────────────────────────────────────

/** 获取携带等级对应的成长率区间信息 */
export function getGrowthRangesByCarryLevel(carryLevel: number): GrowthRange | undefined {
  return GROWTH_RANGES.find((r) => r.carryLevel === carryLevel);
}

/** 获取所有携带等级选项 */
export function getCarryLevelOptions(): { label: string; value: number }[] {
  return GROWTH_RANGES.map((r) => ({
    label: r.label + '级可携带',
    value: r.carryLevel,
  }));
}

/** 获取成长率参考表数据（用于展示） */
export function getGrowthReferenceTable(): {
  carryLevel: number;
  label: string;
  normal: string;
  excellent: string;
  outstanding: string;
  epic: string;
  perfect: string;
}[] {
  return [...GROWTH_RANGES].reverse().map((r) => ({
    carryLevel: r.carryLevel,
    label: r.label,
    normal: r.normal > 0 ? String(r.normal) : '—',
    excellent: r.excellent > 0 ? String(r.excellent) : '—',
    outstanding: r.outstanding > 0 ? String(r.outstanding) : '—',
    epic: r.epic > 0 ? String(r.epic) : '—',
    perfect: String(r.perfect),
  }));
}
