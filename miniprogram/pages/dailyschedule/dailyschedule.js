// dailyschedule.js
// 每日活动时间表：纯静态前端，数据全部写在前端，无后端接口
// 不含周常活动（周常单独页面），仅展示下方提供的每日活动数据

// ===== 活动原始数据（已剔除周常） =====
const RAW_ACTIVITIES = [
  { startTime: '00:00', eventName: '全天可进行', desc: '一千零一个愿望·苏州梁道士 (186, 182)；除恶天劫楼·大理付劫生 (50, 175)；收集签名·大理龚彩云 (170,122)；寒玉谷·苏州林朝雄 (178, 129)；幸运快活三·苏州柳月虹 (130, 230)；夺宝师徒练·大理云飘飘 (265, 129)', endTime: '' },
  { startTime: '00:30', eventName: '消灭千年冰魄', desc: '消灭武夷山的千年冰魄和九个冰妖', endTime: '' },
  { startTime: '00:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '' },
  { startTime: '01:30', eventName: '消灭白冥启', desc: '草原白冥启与九个冥虚奴', endTime: '' },
  { startTime: '02:00', eventName: '贼兵入侵', desc: '太湖、嵩山、镜湖、无量山、剑阁、敦煌', endTime: '03:00' },
  { startTime: '02:30', eventName: '消灭玄击金刚', desc: '苍山玄击金刚与九个玄击神将', endTime: '' },
  { startTime: '03:15', eventName: '宝箱争夺', desc: '圣兽山定点刷新', endTime: '' },
  { startTime: '03:30', eventName: '消灭莽牯毒蛤王', desc: '消灭玄武岛的莽牯毒蛤王和九只莽牯毒蛤', endTime: '' },
  { startTime: '04:00', eventName: '偷袭门派', desc: '随机各大门派', endTime: '04:30' },
  { startTime: '10:00', eventName: '偷袭门派', desc: '随机各大门派', endTime: '10:30' },
  { startTime: '10:15', eventName: '宝箱争夺', desc: '圣兽山定点刷新', endTime: '' },
  { startTime: '10:30', eventName: '消灭千年冰魄', desc: '武夷山千年冰魄与九个冰妖', endTime: '' },
  { startTime: '10:45', eventName: '藏经阁', desc: '西湖、洱海、雁南', endTime: '11:15' },
  { startTime: '10:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '14:45' },
  { startTime: '11:00', eventName: '珍兽龙龟', desc: '圣兽山 (172, 34)（午间多段至15:45，晚间见19:30、23:00）', endTime: '' },
  { startTime: '11:30', eventName: '消灭玄击金刚', desc: '苍山玄击金刚与九个玄击神将', endTime: '14:30' },
  { startTime: '11:30', eventName: '棋局', desc: '苏州苏侨国、洛阳王积薪、大理刘仲甫', endTime: '14:30' },
  { startTime: '11:30', eventName: '楼兰寻宝', desc: '楼兰金久灵 (182, 75)', endTime: '14:30' },
  { startTime: '12:00', eventName: '偷袭门派', desc: '随机各大门派', endTime: '12:30' },
  { startTime: '12:30', eventName: '消灭莽牯毒蛤王', desc: '消灭玄武岛的莽牯毒蛤王和九只莽牯毒蛤', endTime: '' },
  { startTime: '12:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '' },
  { startTime: '13:00', eventName: '凤凰陵墓', desc: '凤凰古城随机刷新', endTime: '14:00' },
  { startTime: '13:00', eventName: '贼兵入侵', desc: '太湖、嵩山、镜湖、无量山、剑阁、敦煌', endTime: '14:00' },
  { startTime: '13:15', eventName: '宝箱争夺', desc: '圣兽山定点刷新', endTime: '' },
  { startTime: '13:30', eventName: '天降奇兽', desc: '楼兰随机刷新', endTime: '14:00' },
  { startTime: '13:30', eventName: '消灭白冥启', desc: '草原白冥启与九个冥虚奴', endTime: '15:30' },
  { startTime: '14:00', eventName: '野猪暴走', desc: '圣兽山', endTime: '16:40' },
  { startTime: '14:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '' },
  { startTime: '15:00', eventName: '贼兵入侵', desc: '太湖、嵩山、镜湖、无量山、剑阁、敦煌', endTime: '16:00' },
  { startTime: '15:30', eventName: '消灭千年冰魄', desc: '武夷山千年冰魄与九个冰妖', endTime: '15:59' },
  { startTime: '15:45', eventName: '珍兽龙龟', desc: '圣兽山 (172, 34)', endTime: '19:30' },
  { startTime: '16:00', eventName: '偷袭门派', desc: '随机各大门派', endTime: '16:30' },
  { startTime: '16:30', eventName: '藏经阁', desc: '西湖、洱海、雁南', endTime: '17:00' },
  { startTime: '16:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '' },
  { startTime: '17:00', eventName: '贼兵入侵', desc: '太湖、嵩山、镜湖、无量山、剑阁、敦煌', endTime: '18:00' },
  { startTime: '18:00', eventName: '消灭玄击金刚', desc: '苍山玄击金刚与九个玄击神将', endTime: '' },
  { startTime: '18:00', eventName: '支援朝廷', desc: '帮会城市牧场官员佟芙蓉 (147, 96)', endTime: '20:00' },
  { startTime: '18:15', eventName: '宝箱争夺', desc: '圣兽山定点刷新', endTime: '' },
  { startTime: '18:30', eventName: '天降奇兽', desc: '楼兰随机刷新', endTime: '19:30' },
  { startTime: '18:30', eventName: '仙草争夺', desc: '镜湖', endTime: '22:00' },
  { startTime: '18:30', eventName: '消灭白冥启', desc: '草原白冥启与九个冥虚奴', endTime: '' },
  { startTime: '18:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '' },
  { startTime: '19:00', eventName: '贼兵入侵', desc: '太湖、嵩山、镜湖、无量山、剑阁、敦煌', endTime: '20:00' },
  { startTime: '19:15', eventName: '保护帮派驻地', desc: '随机各帮派城市', endTime: '20:00' },
  { startTime: '19:30', eventName: '楼兰寻宝', desc: '楼兰金久灵 (182, 75)', endTime: '22:00' },
  { startTime: '19:30', eventName: '消灭莽牯毒蛤王', desc: '消灭玄武岛的莽牯毒蛤王和九只莽牯毒蛤', endTime: '20:00' },
  { startTime: '19:30', eventName: '珍兽龙龟', desc: '圣兽山 (172, 34)', endTime: '23:00' },
  { startTime: '19:45', eventName: '消灭千年冰魄', desc: '武夷山千年冰魄与九个冰妖', endTime: '20:00' },
  { startTime: '20:00', eventName: '偷袭门派', desc: '随机各大门派', endTime: '20:30' },
  { startTime: '20:30', eventName: '棋局', desc: '苏州苏侨国、洛阳王积薪、大理刘仲甫', endTime: '22:00' },
  { startTime: '20:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '' },
  { startTime: '21:00', eventName: '贼兵入侵', desc: '太湖、嵩山、镜湖、无量山、剑阁、敦煌', endTime: '22:00' },
  { startTime: '21:30', eventName: '消灭莽牯毒蛤王', desc: '消灭玄武岛的莽牯毒蛤王和九只莽牯毒蛤', endTime: '23:00' },
  { startTime: '21:45', eventName: '天降奇兽', desc: '楼兰随机刷新', endTime: '22:15' },
  { startTime: '21:30', eventName: '野猪暴走', desc: '圣兽山', endTime: '23:59' },
  { startTime: '21:30', eventName: '藏经阁', desc: '西湖、洱海、雁南', endTime: '22:00' },
  { startTime: '22:00', eventName: '偷袭门派', desc: '随机各大门派', endTime: '22:30' },
  { startTime: '22:30', eventName: '消灭白冥启', desc: '草原白冥启与九个冥虚奴', endTime: '' },
  { startTime: '22:30', eventName: '凤凰陵墓', desc: '凤凰古城随机刷新', endTime: '23:30' },
  { startTime: '22:45', eventName: '竞技场宝箱', desc: '各城竞技场接引人', endTime: '' },
  { startTime: '23:00', eventName: '珍兽龙龟', desc: '圣兽山 (172, 34)', endTime: '23:59' },
  { startTime: '23:30', eventName: '消灭玄击金刚', desc: '消灭苍山的玄击金刚和九个玄击神将', endTime: '' },
  { startTime: '23:30', eventName: '宝箱争夺', desc: '圣兽山定点刷新', endTime: '23:50' },
];

// ===== 每周专属活动数据（周常，按周一~周日排列；timeRange 含完整时段与备注，原样展示） =====
const WEEKLY_ACTIVITIES = [
  {
    week: '周一',
    list: [
      { startTime: '15:00', name: '兽魂之乱', timeRange: '15:00-16:00' },
      { startTime: '19:00', name: '科举', timeRange: '19:00-21:00' },
      { startTime: '21:00', name: '兽魂之乱', timeRange: '21:00-22:00' },
      { startTime: '21:00', name: '兵行四象', timeRange: '21:00-22:00' },
    ],
  },
  {
    week: '周二',
    list: [
      { startTime: '15:00', name: '访谷寻玉', timeRange: '15:00-15:30' },
      { startTime: '19:00', name: '华山论剑', timeRange: '19:00-20:32' },
      { startTime: '19:00', name: '雁门论武', timeRange: '19:00-24:00' },
      { startTime: '20:30', name: '剑纵山河（赛季）', timeRange: '20:30-21:40' },
      { startTime: '21:00', name: '访谷寻玉', timeRange: '21:00-21:30' },
    ],
  },
  {
    week: '周三',
    list: [
      { startTime: '15:00', name: '兽魂之乱', timeRange: '15:00-16:00' },
      { startTime: '15:00', name: '比武大会', timeRange: '15:00-16:00' },
      { startTime: '19:00', name: '仲夏除魔', timeRange: '19:00-22:00（23:59前交任务）' },
      { startTime: '19:00', name: '新杀星', timeRange: '19:00-24:00' },
      { startTime: '20:00', name: '凤凰古城争夺战', timeRange: '20:00-22:00（20:30前进场）' },
      { startTime: '21:00', name: '兽魂之乱', timeRange: '21:00-22:00' },
      { startTime: '21:00', name: '兵行四象', timeRange: '21:00-22:00' },
    ],
  },
  {
    week: '周四',
    list: [
      { startTime: '15:00', name: '访谷寻玉', timeRange: '15:00-15:30' },
      { startTime: '19:00', name: '华山论剑', timeRange: '19:00-20:32' },
      { startTime: '20:00', name: '四方承镖', timeRange: '20:00-22:00' },
      { startTime: '20:30', name: '剑纵山河', timeRange: '20:30-21:40' },
      { startTime: '21:00', name: '访谷寻玉（赛季）', timeRange: '21:00-21:30' },
    ],
  },
  {
    week: '周五',
    list: [
      { startTime: '15:00', name: '兽魂之乱', timeRange: '15:00-16:00' },
      { startTime: '18:00', name: '冠绝师门 - 举贤报名', timeRange: '18:00-24:00' },
      { startTime: '19:00', name: '冠绝师门 - 问鼎', timeRange: '19:00-23:59' },
      { startTime: '19:00', name: '雁门论武', timeRange: '19:00-24:00' },
      { startTime: '21:00', name: '兽魂之乱', timeRange: '21:00-22:00' },
      { startTime: '21:00', name: '兵行四象', timeRange: '21:00-22:00' },
    ],
  },
  {
    week: '周六',
    list: [
      { startTime: '00:00', name: '冠绝师门 - 问鼎', timeRange: '00:00-21:00' },
      { startTime: '00:00', name: '跑商日', timeRange: '00:00-23:59' },
      { startTime: '10:00', name: '冠绝师门 - 举贤投票', timeRange: '10:00-22:00' },
      { startTime: '13:00', name: '镜湖水匪', timeRange: '13:00-22:00' },
      { startTime: '15:00', name: '访谷寻玉', timeRange: '15:00-15:30' },
      { startTime: '15:00', name: '天鉴争锋', timeRange: '15:00-16:00' },
      { startTime: '15:00', name: '比武大会', timeRange: '15:00-16:00' },
      { startTime: '19:00', name: '新杀星', timeRange: '19:00-24:00' },
      { startTime: '20:00', name: '凤凰古城争夺战', timeRange: '20:00-22:00' },
      { startTime: '20:30', name: '剑纵山河', timeRange: '20:30-21:40' },
      { startTime: '21:00', name: '访谷寻玉', timeRange: '21:00-21:30' },
      { startTime: '21:00', name: '天鉴争锋', timeRange: '21:00-22:00' },
    ],
  },
  {
    week: '周日',
    list: [
      { startTime: '15:00', name: '兽魂之乱', timeRange: '15:00-16:00' },
      { startTime: '15:00', name: '华山论剑', timeRange: '15:00-16:32' },
      { startTime: '19:00', name: '支援朝廷', timeRange: '19:00-20:00' },
      { startTime: '19:00', name: '蹴鞠', timeRange: '19:00-23:00（每月第1、第3周日）' },
      { startTime: '20:00', name: '富甲天下', timeRange: '20:00-22:00' },
      { startTime: '21:00', name: '兽魂之乱', timeRange: '21:00-22:00' },
    ],
  },
];

// ===== 活动类型归类 =====
const TYPE_MAP = {
  消灭白冥启: 'BOSS',
  消灭玄击金刚: 'BOSS',
  消灭莽牯毒蛤王: 'BOSS',
  消灭千年冰魄: 'BOSS',
  珍兽龙龟: 'BOSS',
  棋局: '副本',
  楼兰寻宝: '副本',
  藏经阁: '副本',
  凤凰陵墓: '副本',
  天降奇兽: '副本',
  野猪暴走: '副本',
  宝箱争夺: '野外活动',
  仙草争夺: '野外活动',
  竞技场宝箱: '副本',
  贼兵入侵: '野外活动',
  偷袭门派: '副本',
  保护帮派驻地: '野外活动',
  支援朝廷: '野外活动',
  全天可进行: '野外活动',
};
const TYPE_CLASS = { BOSS: 'boss', 副本: 'copy', 野外活动: 'field', 其它: 'other' };

// 未填写结束时间的活动，默认按开始后多少分钟计入“已结束”
const DEFAULT_DURATION = 30;
// 距离开始多少分钟内算“即将”
const SOON_MINUTES = 30;
// 每周专属：距开始多少分钟内算“即将”
const WEEKLY_SOON = 60;

function toMin(t) {
  const p = t.split(':');
  return (+p[0]) * 60 + (+p[1]);
}

// 计算高亮状态：normal(未来) / upcoming(即将) / ongoing(进行中) / ended(已结束)
function computeStatus(start, end, now) {
  const s = toMin(start);
  let e;
  if (end) {
    e = toMin(end);
  } else {
    // 全天活动（00:00 且无结束时间）视为全天进行中
    e = s === 0 ? 24 * 60 : s + DEFAULT_DURATION;
  }
  if (now < s - SOON_MINUTES) return 'normal';
  if (now < s) return 'upcoming';
  if (now <= e) return 'ongoing';
  return 'ended';
}

// 每周专属活动状态：normal(未来) / upcoming(即将) / ongoing(进行中) / ended(已结束)
// s、e 为开始/结束分钟数（已从 timeRange 解析）
function weeklyStatus(s, e, now) {
  if (now < s - WEEKLY_SOON) return 'normal';
  if (now < s) return 'upcoming';
  if (now <= e) return 'ongoing';
  return 'ended';
}

function nowMinutes(d) {
  d = d || new Date();
  return d.getHours() * 60 + d.getMinutes();
}
function fmtClock(d) {
  d = d || new Date();
  const p = (n) => (n < 10 ? '0' : '') + n;
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

// 预处理：归类、加类型样式类、按开始时间排序
function buildList() {
  const list = RAW_ACTIVITIES.map((it, i) => {
    const type = TYPE_MAP[it.eventName] || '其它';
    return {
      id: i,
      startTime: it.startTime,
      endTime: it.endTime || '',
      eventName: it.eventName,
      desc: it.desc || '',
      type,
      typeClass: TYPE_CLASS[type] || 'other',
    };
  });
  list.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  list.forEach((it, i) => (it.id = i));
  return list;
}

Page({
  data: {
    tabIndex: 0, // 0=每日活动  1=每周专属
    weekdayOptions: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    weekdayIndex: 0, // 当前选中的星期（默认今天）
    weeklyItems: [], // 每周专属：当前星期渲染列表（含状态）
    allActs: [],
    filtered: [],
    nowMinutes: 0,
    clock: '',
    showHelp: false,
    showDetail: false,
    detail: {},
    // 底部悬浮广告位高度（rpx）
    adReserve: 220,
    adHidden: false,
    adUnitId: 'adunit-7aa29e044d0b2e8b',
    scrollIntoId: '',
  },

  onLoad() {
    const d = new Date();
    const wd = (d.getDay() + 6) % 7; // JS: 0=周日 -> 6；1=周一 -> 0 …… 映射成「周一~周日」下标
    this.setData({ allActs: buildList(), nowMinutes: nowMinutes(d), clock: fmtClock(d), weekdayIndex: wd });
    this.applyFilter();
    this.updateAnchor();
    this.startTimer();
  },
  onReady() {
    this.updateAnchor();
  },

  onShow() {
    if (!this.timer) this.startTimer();
    this._anchorId = null;
    this.updateAnchor();
  },
  onHide() {
    this.stopTimer();
  },
  onUnload() {
    this.stopTimer();
  },

  // 每秒刷新时钟与高亮状态，保留筛选条件
  startTimer() {
    this.timer = setInterval(() => {
      const d = new Date();
      this.setData({ nowMinutes: nowMinutes(d), clock: fmtClock(d) });
      this.applyFilter();
      if (this.data.tabIndex === 1) {
        this.buildWeeklyView();
      } else {
        this.updateAnchor();
      }
    }, 1000);
  },
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  // 根据当前时间刷新高亮状态（保留全部活动）
  applyFilter() {
    const { allActs, nowMinutes } = this.data;
    const filtered = allActs.map((a) =>
      Object.assign({}, a, { status: computeStatus(a.startTime, a.endTime, nowMinutes) })
    );
    this.setData({ filtered });
  },

  // 根据当前时间，自动滚动定位到「下一个即将开始」的活动
  // （startTime >= 当前时间；若全部已开始则定位到最后一项；跳过常驻的“全天可进行”）
  updateAnchor() {
    const { allActs, nowMinutes } = this.data;
    let anchorId = '';
    for (let i = 0; i < allActs.length; i++) {
      const a = allActs[i];
      if (a.eventName === '全天可进行') continue;
      if (toMin(a.startTime) >= nowMinutes) {
        anchorId = 'act-' + a.id;
        break;
      }
    }
    if (!anchorId && allActs.length) anchorId = 'act-' + allActs[allActs.length - 1].id;
    if (anchorId !== this._anchorId) {
      this._anchorId = anchorId;
      this.setData({ scrollIntoId: anchorId });
    }
  },

  // 切换顶部 Tab（每日活动 / 每周专属）
  onTabChange(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (index === this.data.tabIndex) return;
    this.setData({ tabIndex: index });
    this._anchorId = null; // 重置锚点，进入新 Tab 时重新定位
    if (index === 1) {
      this.buildWeeklyView();
    } else {
      this.updateAnchor();
    }
  },

  // 切换每周专属的星期
  onWeekChange(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (index === this.data.weekdayIndex) return;
    this.setData({ weekdayIndex: index });
    this._anchorId = null;
    this.buildWeeklyView();
  },

  // 构建当前选中星期的每周专属列表（含状态标记与自动定位）
  buildWeeklyView() {
    const { weekdayIndex, nowMinutes } = this.data;
    // 仅“今天”才按当前时间实时标记状态；预览其它星期时不做时间判定，
    // 否则会按“当前时刻”误把其它星期里同时段的活动标成进行中/即将（如周二晚上看周四/周五）
    const todayIndex = (new Date().getDay() + 6) % 7;
    const isToday = weekdayIndex === todayIndex;
    const day = WEEKLY_ACTIVITIES[weekdayIndex];
    const list = (day && day.list) || [];
    // 解析 timeRange 中的「HH:MM-HH:MM」作为起止时间（备注原样保留，不参与计算）
    const items = list.map((it) => {
      const m = /(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})/.exec(it.timeRange);
      let s = toMin(it.startTime);
      let e = s + 30; // 兜底：无结束时间时默认 30 分钟
      if (m) {
        s = (+m[1]) * 60 + (+m[2]);
        e = (+m[3]) * 60 + (+m[4]);
      }
      return {
        startTime: it.startTime,
        name: it.name,
        timeRange: it.timeRange,
        status: isToday ? weeklyStatus(s, e, nowMinutes) : 'normal',
      };
    });
    this.setData({ weeklyItems: items });
    // 自动定位：第一个「进行中」或「即将」的活动
    let wkAnchor = '';
    for (let i = 0; i < items.length; i++) {
      if (items[i].status === 'ongoing' || items[i].status === 'upcoming') {
        wkAnchor = 'wk-' + i;
        break;
      }
    }
    if (wkAnchor !== this._anchorId) {
      this._anchorId = wkAnchor;
      this.setData({ scrollIntoId: wkAnchor });
    }
  },

  // 点击每周专属卡片，弹出详情（复用活动详情弹窗）
  openWeeklyDetail(e) {
    const index = Number(e.currentTarget.dataset.index);
    const it = this.data.weeklyItems[index];
    if (!it) return;
    this.setData({
      showDetail: true,
      detail: { eventName: it.name, startTime: it.startTime, endTime: it.timeRange, type: '周常', desc: it.timeRange },
    });
  },

  openDetail(e) {
    const index = Number(e.currentTarget.dataset.index);
    const detail = this.data.filtered[index];
    if (!detail) return;
    this.setData({ showDetail: true, detail });
  },
  closeDetail() {
    this.setData({ showDetail: false });
  },

  openHelp() {
    this.setData({ showHelp: true });
  },
  closeHelp() {
    this.setData({ showHelp: false });
  },
  // 阻止点击弹窗内容时关闭弹窗
  noop() {},

  // 原生模板广告加载成功：按实际高度 + 底部安全区预留，确保不遮挡内容
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-card')
        .boundingClientRect((rect) => {
          if (!rect || !rect.height) return;
          const info = wx.getSystemInfoSync();
          const winWidth = info.windowWidth;
          let rpx = Math.ceil((rect.height * 750) / winWidth);
          // 叠加底部安全区（刘海/手势条），让广告条完全落在预留空间内
          if (info.safeArea && info.screenHeight) {
            const inset = Math.max(0, info.screenHeight - info.safeArea.bottom);
            rpx += Math.ceil((inset * 750) / winWidth);
          }
          rpx += 16;
          this.setData({ adReserve: rpx });
        })
        .exec();
    };
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },
  onAdError() {
    this.setData({ adReserve: 0, adHidden: true });
  },
});
