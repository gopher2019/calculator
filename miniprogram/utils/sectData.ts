// 门派属性系数数据
// 属性顺序：冰、火、玄、毒

export interface SectData {
  name: string;
  coeff: {
    bing: number; // 冰
    huo: number; // 火
    xuan: number; // 玄
    du: number; // 毒
  };
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

// 门派系数表
export const SECTS: SectData[] = [
  { name: '少林', coeff: { bing: 1, huo: 1, xuan: 1.5, du: 1 } },
  { name: '慕容', coeff: { bing: 1, huo: 1, xuan: 1.5, du: 1 } },
  { name: '天山', coeff: { bing: 1.5, huo: 1, xuan: 1, du: 1 } },
  { name: '明教', coeff: { bing: 1, huo: 1.5, xuan: 1, du: 1 } },
  { name: '丐帮', coeff: { bing: 1, huo: 1.25, xuan: 1, du: 1.3 } },
  { name: '逍遥', coeff: { bing: 1, huo: 1.3, xuan: 1, du: 1.25 } },
  { name: '武当', coeff: { bing: 1.25, huo: 1.2, xuan: 1.1, du: 1 } },
  { name: '峨眉', coeff: { bing: 1.2, huo: 1, xuan: 1.25, du: 1 } },
  { name: '天龙', coeff: { bing: 1.15, huo: 1.15, xuan: 1.15, du: 1.15 } },
  { name: '星宿', coeff: { bing: 1, huo: 1, xuan: 1, du: 1.5 } },
  { name: '唐门', coeff: { bing: 1, huo: 1, xuan: 1.3, du: 1.3 } },
  { name: '鬼谷', coeff: { bing: 1, huo: 1.2, xuan: 1.3, du: 1 } },
  { name: '桃花岛', coeff: { bing: 1.3, huo: 1, xuan: 1, du: 1.2 } },
  { name: '绝情谷', coeff: { bing: 1, huo: 1.3, xuan: 1.2, du: 1 } },
];

export function getSectNames(): string[] {
  return SECTS.map((s) => s.name);
}
