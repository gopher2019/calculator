// weapon.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

interface WeaponResult {
  total: number;
  level: number;
  coefficient: number | null;
  coefficientStr: string;
  star: number;
  starLabel: string;
}

Page({
  ...shareConfig,

  data: {
    power: '',
    spirit: '',
    stamina: '',
    fixed: '',
    agility: '',
    level: '',
    result: null as WeaponResult | null,
    showResult: false,
  },

  onLoad() {
    enableShareMenu();
  },

  onInput(e: any) {
    const field = e.currentTarget.dataset.field as string;
    this.setData({ [field]: e.detail.value } as any);
  },

  // 校验是否为正整数
  parsePositiveInt(value: string, name: string): number | null {
    if (value === '' || value === null || value === undefined) {
      wx.showToast({ title: `请输入${name}`, icon: 'none' });
      return null;
    }
    if (!/^\d+$/.test(value)) {
      wx.showToast({ title: `${name}需为正整数`, icon: 'none' });
      return null;
    }
    const num = parseInt(value, 10);
    if (num <= 0) {
      wx.showToast({ title: `${name}需为正整数`, icon: 'none' });
      return null;
    }
    return num;
  },

  onCalculate() {
    const d = this.data;
    const power = this.parsePositiveInt(d.power, '原始力量');
    if (power === null) return;
    const spirit = this.parsePositiveInt(d.spirit, '原始灵气');
    if (spirit === null) return;
    const stamina = this.parsePositiveInt(d.stamina, '原始体力');
    if (stamina === null) return;
    const fixed = this.parsePositiveInt(d.fixed, '原始定力');
    if (fixed === null) return;
    const agility = this.parsePositiveInt(d.agility, '原始身法');
    if (agility === null) return;
    const level = this.parsePositiveInt(d.level, '暗器修炼等级');
    if (level === null) return;

    if (level === 1) {
      wx.showToast({ title: '修炼等级需大于1', icon: 'none' });
      return;
    }

    const total = power + spirit + stamina + fixed + agility;
    const coefficient = (total - 5) / (level - 1);

    let star = 4;
    let starLabel = '暗器4星';
    if (coefficient >= 3.5) {
      star = 6;
      starLabel = '暗器6星';
    } else if (coefficient >= 3) {
      star = 5;
      starLabel = '暗器5星';
    }

    const result: WeaponResult = {
      total,
      level,
      coefficient,
      coefficientStr: coefficient.toFixed(3),
      star,
      starLabel,
    };

    this.setData({ result, showResult: true });
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
  },
});
