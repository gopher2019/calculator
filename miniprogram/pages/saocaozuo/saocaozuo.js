// 怀旧骚操作 — 纯静态页面，无后端接口
const CARDS = [
  {
    title: '一字 / 两字闪动结拜称号',
    lines: [
      [{ type: 'text', text: '操作教程：' }],
      [{ type: 'text', text: '先组队结拜，然后领取结拜称号，输入：' }],
      [{ type: 'code', text: '#b#i+结拜数字+#i' }],
      [{ type: 'text', text: '然后领取个人称号，输入任意一个字或者两个字即可。' }],
    ],
  },
  {
    title: '卡副本等级',
    lines: [
      [{ type: 'text', text: '操作教程：' }],
      [{ type: 'text', text: '小号开组，大号申请进组，' }],
      [{ type: 'text', text: '然后队长把同意申请和进入副本的按钮重叠，准备连点，' }],
      [{ type: 'text', text: '注意，同意进组在前，然后再点进副本，' }],
      [{ type: 'text', text: '这样最后进队的 ' }, { type: 'num', text: '1‑2' }, { type: 'text', text: ' 个人等级就不计算。' }],
      [{ type: 'text', text: '卡一个比较容易，卡 ' }, { type: 'num', text: '2' }, { type: 'text', text: ' 个以上看手速。' }],
    ],
  },
  {
    title: '修改游戏视角（超远视角）',
    lines: [
      [{ type: 'text', text: '操作教程：' }],
      [{ type: 'text', text: '打开游戏文件夹找到：Bin—system.cfg 文件，右键用记事本或者写字板打开，' }],
      [{ type: 'text', text: '找到 ' }, { type: 'code', text: 'Camera_MaxDistance=27.5' }, { type: 'text', text: ' 这一行，字面意思就是最大视角距离，' }],
      [{ type: 'text', text: '把 ' }, { type: 'num', text: '27.5' }, { type: 'text', text: ' 一般改成 ' }, { type: 'num', text: '40‑50' }, { type: 'text', text: ' 就可以，数字越大视角越远，再大也行，但是太远了也会别扭，具体自己调试。' }],
      [{ type: 'text', text: '然后在游戏里显示设置里面，把经典视距的红点取消就可以了。' }],
      [{ type: 'text', text: '还有一个比较常见的问题是，' }],
      [{ type: 'text', text: '有些人改完以后进游戏，发现视角还是没有变，这是因为本地的缓存设置导致的，' }],
      [{ type: 'text', text: '具体的处理办法是，删除游戏文件夹 ——Accounts 文件夹里的所有文件夹，就是一大串数字字母的那些文件，' }],
      [{ type: 'text', text: '这个文件夹是设置缓存，就是游戏里你自己每个账号设置的一些配置，删除以后重新配置一下就好，不影响游戏本身。' }],
      [{ type: 'text', text: '这些都改完以后，重新登录游戏就是超远视角了。' }],
    ],
  },
  {
    title: '兽魂融魂机制讲解',
    lines: [
      [{ type: 'text', text: '机制说明：' }],
      [{ type: 'text', text: '新的兽魂融魂，成长和资质加成比例能够达到接近 ' }, { type: 'num', text: '1 比 3' }, { type: 'text', text: '，也就是 ' }, { type: 'num', text: '4000' }, { type: 'text', text: ' 资质杰出 ' }, { type: 'num', text: '1667' }, { type: 'text', text: ' 才和 ' }, { type: 'num', text: '2500' }, { type: 'text', text: ' 大完美 ' }, { type: 'num', text: '2188' }, { type: 'text', text: ' 加的接近，' }],
      [{ type: 'text', text: '所以附体一定要大完美，' }],
      [{ type: 'text', text: '低成长高资质可以拿来出战。' }],
    ],
  },
];

// 为列表项补上唯一 id，避免 wx:key 警告
CARDS.forEach(function (c) {
  c.lines.forEach(function (line, li) {
    line.id = li;
    line.forEach(function (seg, si) {
      seg.id = si;
    });
  });
});

Page({
  data: {
    cards: CARDS,
    // 底部悬浮广告位高度（rpx），加载后实测并动态适配，避免遮挡内容或留白
    adReserve: 200,
    // 广告加载失败时隐藏广告位，避免空占位
    adHidden: false,
  },

  // 点击代码 / 指令复制
  copyText(e) {
    const copy = e.currentTarget.dataset.copy;
    if (!copy) return;
    wx.setClipboardData({
      data: copy,
      success: () => {
        wx.showToast({ title: '内容已复制', icon: 'none' });
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
