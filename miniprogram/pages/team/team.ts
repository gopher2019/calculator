// team.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

const TEAM_MIN = 1;
const TEAM_MAX = 119;

interface TeamResult {
  weight: number;    // 加权计算值（2位小数）
  level: number;     // 副本等级（向下取整）
}

Page({
  ...shareConfig,

  data: {
    members: ['', '', '', '', '', ''],
    result: null as TeamResult | null,
    showResult: false,
  },

  onLoad() {
    enableShareMenu();
  },

  onMemberInput(e: any) {
    const idx = e.currentTarget.dataset.index;
    const members = this.data.members.slice();
    members[idx] = e.detail.value;
    this.setData({ members });
  },

  onCalculate() {
    const levels: number[] = [];
    for (let i = 0; i < this.data.members.length; i++) {
      const raw = (this.data.members[i] ?? '').trim();
      if (raw === '') continue;          // 空值忽略
      if (!/^\d+$/.test(raw)) {
        wx.showToast({ title: `队员${i + 1}等级需为正整数`, icon: 'none' });
        return;
      }
      const lv = Number(raw);
      if (lv < TEAM_MIN || lv > TEAM_MAX) {
        wx.showToast({ title: `队员${i + 1}等级需在${TEAM_MIN}~${TEAM_MAX}之间`, icon: 'none' });
        return;
      }
      levels.push(lv);
    }

    if (levels.length === 0) {
      wx.showToast({ title: '请至少输入一名队员等级', icon: 'none' });
      return;
    }

    let sum4 = 0;
    let sum3 = 0;
    for (const lv of levels) {
      sum4 += Math.pow(lv, 4);
      sum3 += Math.pow(lv, 3);
    }
    const val = sum4 / sum3;
    const result: TeamResult = {
      weight: Number(val.toFixed(2)),
      level: Math.floor(val),
    };
    this.setData({ result, showResult: true });
    wx.pageScrollTo({ scrollTop: 9999, duration: 300 });
  },
});
