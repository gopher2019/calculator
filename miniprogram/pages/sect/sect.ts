import { SECTS, ATTRIBUTES, getSectNames } from '../../utils/sectData';
import { shareConfig, enableShareMenu } from '../../utils/share';

interface AttrView {
  key: string;
  name: string;
  valueStr: string;
  isMax: boolean;
}

Page({
  ...shareConfig,

  data: {
    sectNames: [] as string[],
    selectedIndex: 0,
    selectedName: '',
    attrs: [] as AttrView[],
    maxAttr: '' as string,
  },

  onLoad() {
    enableShareMenu();
    this.setData({ sectNames: getSectNames() });
    this.updateSect(0);
  },

  onSectChange(e: any) {
    this.updateSect(Number(e.detail.value));
  },

  // 切换门派：计算四个属性系数，并标记最大值（主属性）
  updateSect(index: number) {
    const sect = SECTS[index];
    const coeff = sect.coeff;

    let maxVal = -1;
    let maxKey = '';
    ATTRIBUTES.forEach((a) => {
      if (coeff[a.key] > maxVal) {
        maxVal = coeff[a.key];
        maxKey = a.key;
      }
    });

    const attrs: AttrView[] = ATTRIBUTES.map((a) => ({
      key: a.key,
      name: a.name,
      valueStr: String(coeff[a.key]),
      isMax: a.key === maxKey,
    }));

    this.setData({
      selectedIndex: index,
      selectedName: sect.name,
      attrs,
      maxAttr: maxKey,
    });
  },
});
