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
    // 元宝收购材料（支持多物品）
    ybItems: [{ price: '', count: '', sub: '' }],
    yb500: '', ybRate: '43',
    // 金币收购材料（支持多物品）
    goldItems: [{ price: '', count: '', sub: '' }],
    gold500: '', goldRate: '43',
    showResult: false,
    resultItems: [],
    resultLines: [],
    calcCache: null,
    adHidden: false,
  },

  itemsKey() {
    return this.data.activeTab === 'yb' ? 'ybItems' : 'goldItems';
  },

  onSwitchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    this.setData({ activeTab: tab, showResult: false, resultLines: [], resultItems: [] });
  },

  // 换算参数（500YB兑换金币数 / 1元购买YB数量）这类单字段输入
  onInput(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
  },

  onBlur(e) {
    this.setData({ [e.currentTarget.dataset.field]: e.detail.value });
    this.calculate(false); // 失焦自动计算（不弹 toast）
  },

  // 物品行输入（名称/单价/数量）
  onItemInput(e) {
    const { index, field } = e.currentTarget.dataset;
    const key = this.itemsKey();
    const item = Object.assign({}, this.data[key][index], { [field]: e.detail.value });
    item.sub = subOf(item);
    this.setData({ [`${key}[${index}]`]: item }, () => this.calculate(false));
  },

  onItemBlur(e) {
    const { index, field } = e.currentTarget.dataset;
    const key = this.itemsKey();
    const item = Object.assign({}, this.data[key][index], { [field]: e.detail.value });
    item.sub = subOf(item);
    this.setData({ [`${key}[${index}]`]: item }, () => this.calculate(false));
  },

  addItem() {
    const key = this.itemsKey();
    const next = this.data[key].concat([{ price: '', count: '', sub: '' }]);
    this.setData({ [key]: next }, () => this.calculate(false));
  },

  removeItem(e) {
    const index = e.currentTarget.dataset.index;
    const key = this.itemsKey();
    const next = this.data[key].slice();
    next.splice(index, 1);
    if (next.length === 0) next.push({ price: '', count: '', sub: '' });
    this.setData({ [key]: next }, () => this.calculate(false));
  },

  onToggleMore() {
    this.setData({ moreInfo: !this.data.moreInfo }, () => this.calculate(false));
  },

  onCalculate() {
    this.calculate(true); // 点击按钮：空参数弹 toast
  },

  // 复制全部结果（逐项小计 + 总价）
  onCopyResult() {
    const { resultItems, resultLines } = this.data;
    if (!resultItems.length) {
      wx.showToast({ title: '暂无可复制结果', icon: 'none' });
      return;
    }
    const lines = resultItems.map((it) => it.sub).concat(resultLines);
    wx.setClipboardData({
      data: lines.join('\n'),
      success: () => wx.showToast({ title: '已复制', icon: 'none' }),
    });
  },

  // 点击单项复制该行
  onCopyItem(e) {
    const it = this.data.resultItems[e.currentTarget.dataset.index];
    if (!it) return;
    wx.setClipboardData({
      data: it.sub,
      success: () => wx.showToast({ title: '已复制', icon: 'none' }),
    });
  },

  // 清空当前 Tab 全部物品与结果
  onClearAll() {
    const key = this.itemsKey();
    this.setData({
      [key]: [{ price: '', count: '', sub: '' }],
      showResult: false,
      resultItems: [],
      resultLines: [],
    });
  },

  onAdLoad() {},

  onAdError() {
    this.setData({ adHidden: true }); // 广告加载失败则隐藏悬浮条，避免遮挡内容
  },

  calculate(showToast) {
    const d = this.data;
    const isYb = d.activeTab === 'yb';
    const items = isYb ? d.ybItems : d.goldItems;

    // 仅累加「单价与数量均有效」的物品
    const valid = items.filter((it) => {
      const p = parseFloat(it.price);
      const c = parseFloat(it.count);
      return !isNaN(p) && !isNaN(c) && p !== 0 && c !== 0;
    });
    if (valid.length === 0) {
      if (showToast) wx.showToast({ title: '请至少填写一项物品的数量与单价', icon: 'none' });
      else this.setData({ showResult: false, resultLines: [], resultItems: [] });
      return;
    }

    const total = valid.reduce((s, it) => s + parseFloat(it.price) * parseFloat(it.count), 0);
    let yb, gold, rmb;
    if (isYb) {
      // 元宝收购：单价(yb) × 数量 → 总元宝
      yb = total;
      if (d.moreInfo) {
        // 1元购买YB数量 与 500YB兑换金币数 各自独立、可单独选填
        const r = parseFloat(d.ybRate);
        const f = parseFloat(d.yb500);
        if (!isNaN(r) && r > 0) rmb = yb / r;          // 人民币 = 总元宝 ÷ (1元购买YB数量)
        if (!isNaN(f) && f > 0) gold = yb * (f / 500); // 总金币 = 总元宝 × (500YB兑换金币数 ÷ 500)
      }
    } else {
      // 金币收购：单价(j) × 数量 → 总金币
      gold = total;
      if (d.moreInfo) {
        const f = parseFloat(d.gold500);
        const r = parseFloat(d.goldRate);
        // 总元宝 = 总金币 ÷ (500YB兑换金币数 ÷ 500)，依赖 500YB兑换金币数
        if (!isNaN(f) && f > 0) {
          yb = gold / (f / 500);
          // 人民币 = 总元宝 ÷ (1元购买YB数量)，依赖上面算出的元宝
          if (!isNaN(r) && r > 0) rmb = yb / r;
        }
      }
    }

    const unit = isYb ? ' yb' : ' j';
    const resultItems = valid.map((it) => {
      const p = parseFloat(it.price);
      const c = parseFloat(it.count);
      const formula = `${fmt(p)} * ${fmt(c)} = ${fmt(p * c)}`;
      return { sub: formula + unit };
    });

    const ybStr = (yb === undefined) ? '' : fmt(yb);
    const goldStr = (gold === undefined) ? '' : fmt(gold);
    const rmbStr = (rmb === undefined) ? '' : '¥' + rmb.toFixed(2);
    const lines = [];
    if (isYb) {
      lines.push('共所需：' + ybStr + ' yb');
      if (gold !== undefined) lines.push('共所需：' + goldStr + ' j');
      if (rmb !== undefined) lines.push('共所需：' + rmbStr);
    } else {
      lines.push('共所需：' + goldStr + ' j');
      if (yb !== undefined) lines.push('共所需：' + ybStr + ' yb');
      if (rmb !== undefined) lines.push('共所需：' + rmbStr);
    }
    this.setData({ calcCache: { yb, gold, rmb }, showResult: true, resultItems, resultLines: lines });
  },
});

// 金币/元宝为整数时直接展示整数，否则保留 2 位小数
function fmt(v) {
  const r = Math.round(v * 100) / 100;
  return Number.isInteger(r) ? String(r) : r.toFixed(2);
}

// 计算单物品小计（无效返回空串；有效返回「单价 * 数量 = 金额」公式）
function subOf(it) {
  const p = parseFloat(it.price);
  const c = parseFloat(it.count);
  if (isNaN(p) || isNaN(c) || p === 0 || c === 0) return '';
  return `${fmt(p)} * ${fmt(c)} = ${fmt(p * c)}`;
}
