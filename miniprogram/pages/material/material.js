Page({
  onShareAppMessage() {
    return {
      title: '墨狐小算器｜材料收购计算｜天龙怀旧服工具',
      path: 'pages/material/material',
      desc: '天龙八部怀旧服实用工具-墨狐小算器，包含攻略、点位、计算器，方便带队刷本、防骗、材料收购计算等。'
    };
  },

  data: {
    activeTab: 'yb',        // 'yb' = 元宝收购材料，'gold' = 金币收购材料
    moreInfo: false,        // 计算更多信息开关（默认关闭）
    // 元宝收购材料
    ybPrice: '', ybCount: '', yb500: '', ybRate: '43',
    // 金币收购材料
    goldPrice: '', goldCount: '', gold500: '', goldRate: '43',
    resultLines: [],
    showResult: false,
    calcCache: null,
    adHidden: false,
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    const d = this.data;
    // 切换 Tab：除「材料单价」外，复用对方已填的数值（有值才带过去，避免清空已填内容）
    const patch = {};
    if (tab === 'yb') {
      if (d.goldCount !== '') patch.ybCount = d.goldCount;
      if (d.gold500 !== '') patch.yb500 = d.gold500;
      if (d.goldRate !== '') patch.ybRate = d.goldRate;
    } else {
      if (d.ybCount !== '') patch.goldCount = d.ybCount;
      if (d.yb500 !== '') patch.gold500 = d.yb500;
      if (d.ybRate !== '') patch.goldRate = d.ybRate;
    }
    this.setData(Object.assign({ activeTab: tab, showResult: false, resultLines: [] }, patch));
  },

  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },

  onBlur(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
    this.calculate(false); // 失焦自动计算（不弹 toast）
  },

  onToggleMore() {
    this.setData({ moreInfo: !this.data.moreInfo }, () => this.calculate(false));
  },

  onCalculate() {
    this.calculate(true); // 点击按钮：空参数弹 toast
  },

  onAdLoad() {},

  onAdError() {
    this.setData({ adHidden: true }); // 广告加载失败则隐藏悬浮条，避免遮挡内容
  },

  calculate(showToast) {
    const d = this.data;
    const isYb = d.activeTab === 'yb';
    const price = isYb ? d.ybPrice : d.goldPrice;
    const count = isYb ? d.ybCount : d.goldCount;
    const yb500 = isYb ? d.yb500 : d.gold500;
    const rate  = isYb ? d.ybRate : d.goldRate;

    const p = parseFloat(price), c = parseFloat(count);
    if ([p, c].some(v => isNaN(v))) {
      if (showToast) wx.showToast({ title: '请填写完整参数', icon: 'none' });
      else this.setData({ showResult: false, resultLines: [] });
      return;
    }

    const needAll = d.moreInfo;
    let yb, gold, rmb;
    if (isYb) {
      // 元宝收购：单价(yb) × 数量 → 总元宝
      yb = p * c;
      if (needAll) {
        const f = parseFloat(yb500), r = parseFloat(rate);
        if (isNaN(f) || isNaN(r)) {
          if (showToast) wx.showToast({ title: '请填写完整参数', icon: 'none' });
          else this.setData({ showResult: false, resultLines: [] });
          return;
        }
        if (f <= 0) {
          if (showToast) wx.showToast({ title: '500YB兑换金币数需大于0', icon: 'none' });
          else this.setData({ showResult: false, resultLines: [] });
          return;
        }
        // 人民币 = 总元宝 ÷ (1元购买YB数量)；总金币 = 总元宝 × (500YB兑换金币数 ÷ 500)
        rmb = yb / r;
        gold = yb * (f / 500);
      }
    } else {
      // 金币收购：单价(j) × 数量 → 总金币
      gold = p * c;
      if (needAll) {
        const f = parseFloat(yb500), r = parseFloat(rate);
        if (isNaN(f) || isNaN(r)) {
          if (showToast) wx.showToast({ title: '请填写完整参数', icon: 'none' });
          else this.setData({ showResult: false, resultLines: [] });
          return;
        }
        if (f <= 0) {
          if (showToast) wx.showToast({ title: '500YB兑换金币数需大于0', icon: 'none' });
          else this.setData({ showResult: false, resultLines: [] });
          return;
        }
        // 总元宝 = 总金币 ÷ (500YB兑换金币数 ÷ 500)；人民币 = 总元宝 ÷ (1元购买YB数量)
        yb = gold / (f / 500);
        rmb = yb / r;
      }
    }
    this.setData({ calcCache: { yb, gold, rmb }, showResult: true }, () => this.renderLines());
  },

  renderLines() {
    const { activeTab, moreInfo, calcCache } = this.data;
    if (!calcCache) { this.setData({ showResult: false, resultLines: [] }); return; }
    const { yb, gold, rmb } = calcCache;
    const ybStr = fmt(yb);
    const goldStr = fmt(gold);
    const rmbStr = (rmb === undefined) ? '' : '¥' + rmb.toFixed(2);
    const lines = [];
    if (activeTab === 'yb') {
      lines.push('共所需：' + ybStr + ' yb');
      if (moreInfo && rmb !== undefined) {
        lines.push('共所需：' + rmbStr);
        lines.push('共所需：' + goldStr + ' j');
      }
    } else {
      lines.push('共所需：' + goldStr + ' j');
      if (moreInfo && rmb !== undefined) {
        lines.push('共所需：' + rmbStr);
        lines.push('共所需：' + ybStr + ' yb');
      }
    }
    this.setData({ showResult: true, resultLines: lines });
  },
});

// 金币/元宝为整数时直接展示整数，否则保留 2 位小数
function fmt(v) {
  const r = Math.round(v * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
}
