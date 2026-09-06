// 活动点位攻略（刷反｜刷和尚）— 纯静态页面，无后端请求

// 解析坐标文本：识别 (数字,数字) 格式
function parseCoords(raw) {
  const regex = /\((\d+)\s*,\s*(\d+)\)/g;
  const list = [];
  let m;
  while ((m = regex.exec(raw)) !== null) {
    list.push({ x: parseInt(m[1], 10), y: parseInt(m[2], 10) });
  }
  return list;
}

// 反贼地图点位（原始坐标），顺序按推荐跑图路线：镜湖 → 太湖 → 无量山 → 剑阁 → 敦煌 → 嵩山
const FAN_MAPS = [
  {
    name: '镜湖【掌柜要诀高产地图】',
    desc: '右下角大片水域周围，经常一次性刷多只反贼，新区抢掌柜必蹲！',
    coords: '(60,112),(85,158),(114,128),(141,181),(166,94),(192,138),(219,176),(244,123),(262,243),(270,195)',
  },
  {
    name: '太湖',
    desc: '苏州出口附近、地图中间石桥位置是高发区域。',
    coords: '(49,116),(75,166),(106,135),(133,190),(158,96),(184,141),(211,180),(236,124),(262,169),(285,210)',
  },
  {
    name: '无量山',
    desc: '优先查看大理城门口、栈道中段、剑阁传送路口。',
    coords: '(48,120),(66,184),(90,152),(124,211),(140,92),(178,120),(199,188),(226,154),(241,213),(267,109)',
  },
  {
    name: '剑阁',
    desc: '主要蹲守敦煌交界、地图下半段小路。',
    coords: '(62,97),(82,142),(111,156),(130,111),(168,88),(194,121),(210,170),(247,140),(265,191),(286,216)',
  },
  {
    name: '敦煌',
    desc: '蹲洛阳出城口、月牙泉周边区域。',
    coords: '(51,103),(77,159),(104,126),(136,182),(155,88),(182,131),(208,174),(231,118),(259,156),(280,204)',
  },
  {
    name: '嵩山',
    desc: '洛阳传送点附近、右侧山道巡逻。',
    coords: '(54,108),(81,161),(109,130),(138,184),(161,91),(188,136),(214,177),(239,121),(265,162),(288,201)',
  },
];

// 刷和尚地图点位（原始坐标），顺序按推荐跑图路线：雁南 → 洱海 → 西湖
const SHANG_MAPS = [
  {
    name: '雁南',
    desc: '洛阳出口附近、草原中间空旷地带优先查看。',
    coords: '(58,114),(86,160),(115,131),(142,183),(167,95),(193,139),(220,175),(245,122),(271,164),(291,203)',
  },
  {
    name: '洱海',
    desc: '大理出城门口、雁南交界位置、西侧海岸线查找。',
    coords: '(56,110),(83,157),(112,127),(139,180),(163,92),(190,135),(216,173),(241,120),(267,161),(289,200)',
  },
  {
    name: '西湖',
    desc: '苏州出入口、通往龙泉的传送口、水坝一带巡逻。',
    coords: '(53,105),(79,154),(108,124),(135,178),(160,89),(186,133),(212,171),(238,119),(264,159),(286,198)',
  },
];

// 原始坐标 -> 解析后的 {x, y} 数组
function buildMaps(arr) {
  return arr.map((m) => ({
    name: m.name,
    desc: m.desc,
    coords: parseCoords(m.coords),
  }));
}

const TABS = [
  {
    name: '反贼',
    title: '造反恶贼【刷反】',
    intro: '活动简介：造反恶贼（俗称刷反），击杀反贼可以获得宝石、金币、掌柜要诀等珍贵道具，是怀旧服人气很高的定时野外活动。',
    timeLabel: '活动时间：02:00、13:00、15:00、17:00、19:00、21:00，每次活动持续1小时',
    mapLabel: '活动地图：剑阁、无量山、敦煌、太湖、嵩山、镜湖',
    routeLabel: '刷反推荐跑图路线',
    route: '镜湖 → 太湖 → 无量山 → 剑阁 → 敦煌 → 嵩山',
    maps: buildMaps(FAN_MAPS),
    tips: [
      '活动开启前5分钟提前飞到第一张地图蹲点，不要卡点再出发，容易抢不到怪；',
      '游戏自动寻路可以直接输入坐标快速跳转点位，不用手动乱跑；',
      '一张地图刷出几只怪之后，如果找遍点位都没有，直接换下一张地图；',
      '镜湖产出掌柜要诀概率更高，刷反优先跑镜湖。',
    ],
  },
  {
    name: '和尚',
    title: '藏经阁【刷和尚】',
    intro: '活动简介：藏经阁也就是大家说的刷和尚，击杀云游武僧可以拿到打孔材料、门派技能书，是打造装备必刷的定时活动。',
    timeLabel: '活动时间：10:45–11:15，16:30–17:00，21:30–22:00，23:00–23:30',
    mapLabel: '活动地图：西湖、洱海、雁南',
    routeLabel: '刷和尚推荐跑图路线',
    route: '雁南 → 洱海 → 西湖',
    maps: buildMaps(SHANG_MAPS),
    tips: [
      '活动开启前5分钟提前飞到第一张地图蹲点，不要卡点再出发，容易抢不到怪；',
      '游戏自动寻路可以直接输入坐标快速跳转点位，不用手动乱跑；',
      '一张地图刷出几只怪之后，如果找遍点位都没有，直接换下一张地图；',
    ],
  },
];

Page({
  data: {
    tabs: TABS,
    activeTab: 0,
    activeTabData: TABS[0],
    // 底部悬浮广告位高度（rpx），加载后实测并动态适配，避免遮挡内容或留白
    adReserve: 200,
    // 广告加载失败时隐藏广告位，避免空占位
    adHidden: false,
  },

  // 切换反贼 / 和尚
  switchTab(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      activeTab: index,
      activeTabData: this.data.tabs[index],
    });
  },

  // 点击坐标左/右部分，分别复制 x / y
  copySide(e) {
    const value = e.currentTarget.dataset.value;
    if (value === undefined || value === null) return;
    wx.setClipboardData({
      data: String(value),
      success: () => {
        wx.showToast({ title: `已复制 ${value}`, icon: 'none' });
      },
    });
  },

  // 原生模板广告加载成功：多次实测、以最终稳定高度为准（广告先占位后收缩），避免预留过高留白
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-card')
        .boundingClientRect((rect) => {
          if (!rect || !rect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          const rpx = Math.ceil((rect.height * 750) / winWidth) + 40;
          this.setData({ adReserve: rpx });
        })
        .exec();
    };
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：隐藏广告位并收回预留空间，避免空占位
  onAdError() {
    this.setData({ adReserve: 20, adHidden: true });
  },
});
