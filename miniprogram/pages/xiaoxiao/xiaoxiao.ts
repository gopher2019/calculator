// xiaoxiao.ts
import { shareConfig, enableShareMenu } from '../../utils/share';

interface Coord {
  x: number;
  y: number;
}

// 单个时间点（整点 / 15分 / 30分）
interface TimeSlot {
  label: string;      // 时间点名称
  fileID: string;     // 该时间点对应图片（不同时间点可能共用同一张图）
  raw: string;        // 原始坐标文本
  coords: Coord[];
  image: string;      // 解析后的临时图片地址（默认空，加载后回填）
  imageError: string; // 图片加载失败提示
}

interface Sect {
  name: string;
  slots: TimeSlot[];
}

// 解析坐标文本：识别 (数字,数字) 格式，跳过不完整项
function parseCoords(raw: string): Coord[] {
  const regex = /\((\d+)\s*,\s*(\d+)\)/g;
  const list: Coord[] = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(raw)) !== null) {
    list.push({ x: parseInt(m[1], 10), y: parseInt(m[2], 10) });
  }
  return list;
}

const SECTS: Sect[] = [
  {
    name: '慕容',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/murong.png',
        raw: [
          '(65,125)',
          '(29,147)',
          '(39,159) (52,163)',
          '(63,141)',
          '(39,107) (67,104) (77,115) (89,109) (86,134)',
          '(104,125) (94,89)',
          '(80,53)',
          '(56,45)',
          '(46,66)',
          '(46,32)',
          '(63,67)',
          '(58,24)',
          '(27,57)',
          '(28,23)',
          '(118,44) (135,42) (158,51) (172,55) (162,97)',
          '(144,97) (141,132) (141,163) (162,34)',
          '(33,76)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/murong15.png',
        raw: [
          '(30,167)',
          '(134,29)',
          '(45,124) (67,104) (86,134)',
          '(56,45)',
          '(162,34) (153,76) (162,97) (165,137)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/murong30.png',
        raw: [
          '(41,157)',
          '(55,57)',
          '(74,25)',
          '(165,84) (134,117)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '峨眉',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/emei.png',
        raw: [
          '(95,88)',
          '(66,110) (56,130) (56,137) (56,149)',
          '(38,148) (35,131) (36,119) (39,108)',
          '(55,54)',
          '(95,62)',
          '(48,40)',
          '(39,46)',
          '(106,48) (105,38)',
          '(35,58)',
          '(94,38)',
          '(54,93)',
          '(94,69)',
          '(84,38)',
          '(84,38) (139,106) (152,108) (144,153) (149,77)',
          '(139,74) (138,49) (136,39) (148,40) (149,49)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/emei15.png',
        raw: [
          '(95,62)',
          '(63,140)',
          '(83,145) (139,49)',
          '(60,150) (62,155)',
          '(149,40) (38,108)',
          '(48,40)',
          '(99,145)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 复用 15 分图片
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/emei15.png',
        raw: [
          '(52,91)',
          '(54,50)',
          '(34,58) (54,129) (35,152)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '丐帮',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/gaibang.png',
        raw: [
          '(91,124)',
          '(97,106)',
          '(71,97) (111,110)',
          '(86,106)',
          '(78,60)',
          '(71,115)',
          '(71,106)',
          '(103,61)',
          '(92,46)',
          '(125,63) (101,141) (83,141) (71,140) (43,133)',
          '(44,113)',
          '(45,36)',
          '(153,61)',
          '(44,90)',
          '(86,36)',
          '(44,76)',
          '(39,60)',
          '(110,36) (127,37)',
          '(53,55)',
          '(153,50)',
          '(133,82) (148,113) (148,140) (131,150)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/gaibang15.png',
        raw: [
          '(90,124) (96,106)',
          '(69,102) (60,150) (50,150)',
          '(54,136) (57,110)',
          '(53,55)',
          '(46,36)',
          '(133,82)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 复用 15 分图片
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/gaibang15.png',
        raw: [
          '(113,93) (111,36) (154,46) (154,61)',
          '(133,83)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '明教',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/mingjiao.png',
        raw: [
          '(96,147) (97,110)',
          '(97,89)',
          '(98,70)',
          '(83,71)',
          '(109,69) (142,78) (155,50) (154,36) (114,39)',
          '(79,39)',
          '(35,97)',
          '(37,37)',
          '(36,113)',
          '(34,53)',
          '(37,140)',
          '(39,77)',
          '(35,87)',
          '(39,153) (50,154)',
          '(59,154) (61,141) (81,139) (81,153) (113,136)',
          '(113,152) (158,140) (153,118) (140,117) (154,99)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/mingjiao15.png',
        raw: [
          '(96,110) (154,36)',
          '(35,112)',
          '(35,147)',
          '(39,75)',
          '(39,77)',
          '(28,97)',
          '(36,153) (62,141) (113,136)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 暂用 15 分图片占位（你未提供，确认后替换为 mingjiao30.png）
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/mingjiao15.png',
        raw: [
          '(110,63) (156,49)',
          '(130,55) (155,115) (115,153)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '少林',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/shaolin.png',
        raw: [
          '(95,130)',
          '(95,120) (95,111) (103,106) (112,106)',
          '(116,116) (116,125) (124,102) (84,105)',
          '(79,108) (65,102)',
          '(70,90)',
          '(64,87)',
          '(79,95)',
          '(55,98)',
          '(66,120) (42,100) (68,148) (54,146) (47,139)',
          '(41,130) (41,121)',
          '(42,48)',
          '(128,56)',
          '(42,74)',
          '(41,65)',
          '(40,55)',
          '(149,67) (149,99) (152,144)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/shaolin15.png',
        raw: [
          '(54,146)',
          '(94,120)',
          '(62,102)',
          '(79,96)',
          '(80,60)',
          '(60,55)',
          '(124,102)',
          '(40,55) (146,111) (154,143)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 复用 15 分图片
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/shaolin15.png',
        raw: [
          '(65,120) (154,52)',
          '(154,72)',
          '(144,80)',
          '(121,58)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '天龙',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/tianlong.png',
        raw: [
          '(94,128)',
          '(95,106) (116,114) (131,132) (135,152)',
          '(152,150) (154,126) (127,94) (154,88)',
          '(94,89)',
          '(94,71)',
          '(83,71)',
          '(138,35) (110,35)',
          '(42,63)',
          '(39,76)',
          '(123,67) (146,56) (152,35)',
          '(94,38)',
          '(55,74)',
          '(54,38)',
          '(63,73)',
          '(41,46)',
          '(65,96)',
          '(65,123) (64,145) (42,104) (41,130) (24,126)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/tianlong15.png',
        raw: [
          '(152,150)(123,67)',
          '(110,35)',
          '(41,64)',
          '(65,150) (63,152)',
          '(37,131) (41,136)',
          '(64,123)',
          '(22,126)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 暂用 15 分图片占位（你未提供，确认后替换为 tianlong30.png）
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/tianlong15.png',
        raw: [
          '(64,90) (50,100) (40,99)',
          '(65,73) (50,75)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '天山',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/tianshan.png',
        raw: [
          '(81,119) (61,126)',
          '(49,126) (50,140) (39,146)',
          '(49,110) (34,110) (32,100)',
          '(41,67)',
          '(39,47)',
          '(48,77)',
          '(32,88)',
          '(66,87)',
          '(36,76)',
          '(69,99)',
          '(84,100) (99,100) (107,120) (135,124) (152,142)',
          '(121,96) (125,80) (152,82) (152,61)',
          '(84,72)',
          '(89,50)',
          '(60,41)',
          '(108,49)',
          '(94,79)',
          '(125,50)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/tianshan15.png',
        raw: [
          '(59,126) (42,124) (47,132) (50,140) (43,146)',
          '(41,67)',
          '(65,87)',
          '(124,50) (135,124) (50,140)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 暂用 15 分图片占位（你未提供，确认后替换为 tianshan30.png）
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/tianshan15.png',
        raw: [
          '(34,110) (32,100) (67,82)',
          '(125,44) (130,52)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '武当',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/wudang.png',
        raw: [
          '(94,137) (79,135) (72,143) (77,112)',
          '(95,111) (104,127)',
          '(86,83)',
          '(40,55)',
          '(80,50)',
          '(99,87)',
          '(54,57)',
          '(78,43)',
          '(91,98)',
          '(44,94)',
          '(58,68)',
          '(90,55)',
          '(78,92)',
          '(45,78)',
          '(63,61)',
          '(96,42)',
          '(63,99)',
          '(70,83)',
          '(45,70)',
          '(74,58)',
          '(97,66)',
          '(108,165) (89,179) (60,180) (44,164) (45,145)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/wudang15.png',
        raw: [
          '(78,112)',
          '(95,42)',
          '(94,111)',
          '(42,95)',
          '(44,78)',
          '(39,55)',
          '(68,182) (54,179) (42,168) (45,163)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 暂用 15 分图片占位（你未提供，确认后替换为 wudang30.png）
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/wudang15.png',
        raw: [
          '(94,126) (108,128) (86,84) (44,146)',
          '(93,112)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '逍遥',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/xiaoyao.png',
        raw: [
          '(69,150)',
          '(40,152)',
          '(63,62)',
          '(64,135)',
          '(54,73)',
          '(68,54)',
          '(48,127)',
          '(45,72)',
          '(49,146)',
          '(52,63)',
          '(40,149)',
          '(47,55)',
          '(117,90) (145,58) (157,64)',
          '(156,57) (159,50) (149,44) (138,43) (130,43)',
          '(120,42) (148,118) (143,124) (149,129) (129,136)',
          '(119,139) (113,146) (118,153) (148,147) (90,124)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/xiaoyao15.png',
        raw: [
          '(73,153)',
          '(66,151) (41,149)',
          '(52,148)',
          '(69,55)',
          '(156,58)',
          '(157,65) (148,119) (149,150) (64,135)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 暂用 15 分图片占位（你未提供，确认后替换为 xiaoyao30.png）
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/xiaoyao15.png',
        raw: [
          '(132,153) (151,135) (153,128) (114,93) (152,114)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '星宿',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/xingxiu.png',
        raw: [
          '(108,146) (89,140) (124,147) (136,150) (143,140)',
          '(146,126) (142,93) (125,100) (110,113) (109,125)',
          '(98,130)',
          '(60,118)',
          '(43,93)',
          '(95,91)',
          '(70,140) (55,140) (44,129) (43,148)',
          '(70,107)',
          '(46,53)',
          '(67,63)',
          '(61,96)',
          '(50,83)',
          '(39,84)',
          '(84,114) (98,130) (95,110)',
          '(95,53)',
          '(114,54) (147,55)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/xingxiu15.png',
        raw: [
          '(137,149) (109,113) (43,131) (57,118) (69,107)',
          '(42,93)',
          '(80,119) (95,110) (115,54)',
          '(123,73)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 暂用 15 分图片占位（你未提供，确认后替换为 xingxiu30.png）
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/xingxiu15.png',
        raw: [
          '(108,133) (128,147) (138,149) (148,143) (146,124)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '曼陀',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/mantuo.png',
        raw: [
          '(136,138) (124,128) (137,115) (151,125) (120,158)',
          '(98,179)',
          '(87,168) (54,190) (52,179) (42,195)',
          '(40,203)',
          '(67,140) (66,120)',
          '(79,75)',
          '(136,88)',
          '(81,25)',
          '(96,25)',
          '(92,68)',
          '(136,35) (166,40)',
          '(177,70)',
          '(183,83)',
          '(216,95) (177,119) (186,131)',
          '(218,159) (194,164) (169,165) (223,188) (230,192)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/mantuo15.png',
        raw: [
          '(115,169) (135,138) (125,106) (52,180) (36,207)',
          '(69,129)',
          '(81,25)',
          '(177,70)',
          '(189,78) (223,188)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        // 暂用 15 分图片占位（你未提供，确认后替换为 mantuo30.png）
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/mantuo15.png',
        raw: [
          '(86,104) (110,103) (71,51) (195,135) (152,152)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
  {
    name: '恶人谷',
    slots: [
      {
        label: '整点',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/erengu.png',
        raw: [
          '(191,155) (183,160) (180,153) (183,135) (175,132)',
          '(169,128) (165,123) (164,113) (172,111) (183,120)',
          '(134,119) (122,125) (115,124) (134,108) (130,100)',
          '(122,101) (110,110) (32,116) (46,139) (40,153)',
          '(24,171) (32,187)',
          '(47,204) (55,199) (59,207)',
          '(64,217) (153,204) (178,181) (167,177) (174,185)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '15分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/erengu15.png',
        raw: [
          '(194,54)',
          '(60,81)',
          '(50,106) (35,118) (49,142)',
        ].join('\n'),
        coords: [],
        image: '',
      },
      {
        label: '30分',
        fileID: 'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/xiaoxiao/erengu30.png',
        raw: [
          '(194,54)',
          '(60,81)',
          '(50,106) (35,118) (49,142)',
        ].join('\n'),
        coords: [],
        image: '',
      },
    ],
  },
];

Page({
  ...shareConfig,

  data: {
    sects: [] as Sect[],
    activeSect: 0,
    activeName: '',
    // 各时间点是否展开，默认仅整点（index 0）展开，其余可手动展开/折叠
    expanded: [true, false, false] as boolean[],
    scrollTop: 0,
  },

  onLoad() {
    enableShareMenu();
    const sects = SECTS.map((s) => ({
      ...s,
      slots: s.slots.map((slot) => ({
        ...slot,
        coords: parseCoords(slot.raw),
        image: '',
        imageError: '',
      })),
    }));
    this.setData({ sects });
    this.selectSect(0);
  },

  selectSect(e: any) {
    const index = typeof e === 'number' ? e : e.currentTarget.dataset.index as number;
    const sect = this.data.sects[index];
    if (!sect) return;
    // 切换门派时，重置为默认展开整点
    const expanded = [true, false, false];
    this.setData({
      activeSect: index,
      activeName: sect.name,
      expanded,
      scrollTop: 0,
    });
    // 加载整点图片
    this.loadSlotImage(index, 0);
  },

  // 点击时间点标题：切换展开/折叠（互不影响，可多个同时展开）
  toggleSlot(e: any) {
    const slotIndex = e.currentTarget.dataset.index as number;
    const expanded = this.data.expanded.slice();
    expanded[slotIndex] = !expanded[slotIndex];
    this.setData({ expanded });
    if (expanded[slotIndex]) {
      this.loadSlotImage(this.data.activeSect, slotIndex);
    }
  },

  // 加载指定时间点图片（云函数获取临时地址，回填到对应 slot）
  loadSlotImage(sectIndex: number, slotIndex: number) {
    const slot = this.data.sects[sectIndex].slots[slotIndex];
    if (!slot || slot.image) return; // 已加载过

    wx.cloud.callFunction({
      name: 'getImageUrl',
      data: { fileList: [slot.fileID] },
      success: (res: any) => {
        const result = res.result as { code: number; msg: string; list?: any[] };
        if (result.code !== 0 || !result.list || !result.list[0]) {
          console.error('[宵小图片获取地址失败]', result);
          this.setSlotError(sectIndex, slotIndex, `图片地址获取失败：${result.msg}`);
          return;
        }
        const file = result.list[0];
        if (!file.tempFileURL) {
          console.error('[宵小图片地址为空]', file);
          this.setSlotError(sectIndex, slotIndex, `图片地址为空：${file.status} ${file.errMsg}`);
          return;
        }
        const sects = this.data.sects;
        sects[sectIndex].slots[slotIndex].image = file.tempFileURL;
        sects[sectIndex].slots[slotIndex].imageError = '';
        this.setData({ sects });
      },
      fail: (err) => {
        console.error('[宵小图片云函数调用失败]', err);
        this.setSlotError(sectIndex, slotIndex, `云函数调用失败：${err.errMsg}`);
      },
    });
  },

  setSlotError(sectIndex: number, slotIndex: number, msg: string) {
    const sects = this.data.sects;
    sects[sectIndex].slots[slotIndex].imageError = msg;
    this.setData({ sects });
  },

  copySide(e: any) {
    const value = e.currentTarget.dataset.value as number;
    wx.setClipboardData({
      data: String(value),
      success: () => wx.showToast({ title: `已复制 ${value}`, icon: 'none' }),
    });
  },
});
