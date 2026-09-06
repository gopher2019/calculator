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
    // 原生模板广告位真实高度（rpx），加载后实测并动态适配
    adReserve: 0,
    // 广告加载失败时隐藏广告位，避免空占位
    adHidden: false,
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

  // 原生模板广告加载成功：多次实测、以最终稳定高度为准（广告先占位后收缩），避免预留过高留白
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-slot')
        .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | undefined) => {
          if (!rect || !rect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          const rpx = Math.ceil((rect.height * 750) / winWidth);
          this.setData({ adReserve: rpx });
        })
        .exec();
    };
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：隐藏广告位，避免空占位
  onAdError() {
    this.setData({ adReserve: 0, adHidden: true });
  },
});
