import { SECTS, POTENTIALS, ATTRIBUTES } from '../../utils/sectData';
import { shareConfig, enableShareMenu } from '../../utils/share';

interface AttrView {
  key: string; // 用于配色 class: ice/fire/mystic/poison
  name: string;
  value: number;
}

// 属性 key -> 配色标识
const ELEM_COLOR: Record<string, string> = {
  bing: 'ice',
  huo: 'fire',
  xuan: 'mystic',
  du: 'poison',
};

Page({
  ...shareConfig,

  data: {
    activeTab: 0,
    elemSects: [] as { name: string; attrs: AttrView[] }[],
    potentials: POTENTIALS,
  },

  onLoad() {
    enableShareMenu();
    // 预处理冰火玄毒视图数据，避免 wxml 动态 key 兼容问题
    const elemSects = SECTS.map((s) => ({
      name: s.name,
      attrs: ATTRIBUTES.map((a) => ({
        key: ELEM_COLOR[a.key],
        name: a.name,
        value: s.coeff[a.key],
      })),
    }));
    this.setData({ elemSects });
  },

  switchTab(e: any) {
    this.setData({ activeTab: Number(e.currentTarget.dataset.tab) });
  },
});
