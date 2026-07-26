// 门派属性系数数据（集中存放，便于后期微调）
// 门派顺序统一为需求指定的 13 大门派

export interface SectData {
  name: string;
  coeff: {
    bing: number; // 冰
    huo: number; // 火
    xuan: number; // 玄
    du: number; // 毒
  };
}

export interface PotentialData {
  name: string;
  str: number; // 1 力量 = 外攻
  int: number; // 1 灵气 = 内功
  con: number; // 1 体力 = 血上限
  fix: number; // 1 定力 = 气上限
  agi: number; // 1 身法 = 命中
  dodge: number; // 1 身法 = 闪避
  crit: number; // 1 身法 = 会心 & 会防
}

export interface AttributeMeta {
  key: keyof SectData['coeff'];
  name: string; // 显示名（冰/火/玄/毒）
}

// 四个属性元信息（展示顺序）
export const ATTRIBUTES: AttributeMeta[] = [
  { key: 'bing', name: '冰' },
  { key: 'huo', name: '火' },
  { key: 'xuan', name: '玄' },
  { key: 'du', name: '毒' },
];

// 门派冰火玄毒单属性伤害系数（顺序同需求指定）
export const SECTS: SectData[] = [
  { name: '武当', coeff: { bing: 1.25, huo: 1.2, xuan: 1.1, du: 1 } },
  { name: '峨眉', coeff: { bing: 1.2, huo: 1, xuan: 1.25, du: 1 } },
  { name: '逍遥', coeff: { bing: 1, huo: 1.3, xuan: 1, du: 1.25 } },
  { name: '星宿', coeff: { bing: 1, huo: 1, xuan: 1, du: 1.5 } },
  { name: '天龙', coeff: { bing: 1.15, huo: 1.15, xuan: 1.15, du: 1.15 } },
  { name: '明教', coeff: { bing: 1, huo: 1.5, xuan: 1, du: 1 } },
  { name: '天山', coeff: { bing: 1.5, huo: 1, xuan: 1, du: 1 } },
  { name: '丐帮', coeff: { bing: 1, huo: 1.25, xuan: 1, du: 1.3 } },
  { name: '少林', coeff: { bing: 1, huo: 1, xuan: 1.5, du: 1 } },
  { name: '慕容', coeff: { bing: 1, huo: 1, xuan: 1.5, du: 1 } },
  { name: '唐门', coeff: { bing: 1, huo: 1, xuan: 1.3, du: 1.3 } },
  { name: '鬼谷', coeff: { bing: 1, huo: 1.2, xuan: 1.3, du: 1 } },
  { name: '桃花岛', coeff: { bing: 1.3, huo: 1, xuan: 1, du: 1.2 } },
  { name: '绝情谷', coeff: { bing: 1, huo: 1.3, xuan: 1.2, du: 1 } },
];

// 门派五维潜能成长（顺序同需求指定）
export const POTENTIALS: PotentialData[] = [
  { name: '武当', str: 4.4, int: 8.9, con: 44, fix: 32, agi: 8, dodge: 3, crit: 0.07 },
  { name: '峨眉', str: 4.4, int: 7.6, con: 50, fix: 40, agi: 8, dodge: 2, crit: 0.06 },
  { name: '逍遥', str: 4.4, int: 7.6, con: 50, fix: 36, agi: 7, dodge: 4, crit: 0.06 },
  { name: '星宿', str: 4.4, int: 7.6, con: 52, fix: 36, agi: 6, dodge: 3, crit: 0.06 },
  { name: '天龙', str: 6.4, int: 6.4, con: 58, fix: 27, agi: 9, dodge: 3, crit: 0.06 },
  { name: '明教', str: 8.25, int: 4.4, con: 56, fix: 20, agi: 7, dodge: 3, crit: 0.06 },
  { name: '天山', str: 7.6, int: 4.4, con: 55, fix: 20, agi: 8, dodge: 3, crit: 0.08 },
  { name: '丐帮', str: 7.6, int: 4.4, con: 60, fix: 20, agi: 8, dodge: 4, crit: 0.07 },
  { name: '少林', str: 7.6, int: 4.4, con: 70, fix: 25, agi: 6, dodge: 2, crit: 0.05 },
  { name: '慕容', str: 4.4, int: 8.9, con: 60, fix: 25, agi: 8, dodge: 4, crit: 0.07 },
  { name: '唐门', str: 4.4, int: 7.6, con: 55, fix: 20, agi: 9, dodge: 3, crit: 0.09 },
  { name: '鬼谷', str: 4.4, int: 7.6, con: 58, fix: 30, agi: 8, dodge: 3.5, crit: 0.06 },
  { name: '桃花岛', str: 7.6, int: 4.4, con: 52, fix: 25, agi: 9, dodge: 4, crit: 0.09 },
  { name: '绝情谷', str: 8.25, int: 4.4, con: 54, fix: 35, agi: 9, dodge: 4, crit: 0.1 },
];

export function getSectNames(): string[] {
  return SECTS.map((s) => s.name);
}
