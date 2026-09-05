// 云函数：handcraft_getRandomHandImg
// 功能：根据传入的 type（xianglian / hufu）随机返回对应目录下的成品图片 fileID；鉴定不消耗次数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 各类型成品图片在云存储中的目录前缀与总数
// 编号 n 对应 目录/n.png
const TYPE_MAP = {
  xianglian: {
    prefix:
      'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/shougong/xianglian/85/',
    total: 104,
  },
  hufu: {
    prefix:
      'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/shougong/hufu/85/',
    total: 149,
  },
};

exports.main = async (event, context) => {
  // 默认项链；护符走 hufu 分支（图片 1~149）
  const type = event && event.type === 'hufu' ? 'hufu' : 'xianglian';
  const conf = TYPE_MAP[type];

  // 生成 [1, total] 闭区间随机整数
  const n = Math.floor(Math.random() * conf.total) + 1;
  const imgUrl = `${conf.prefix}${n}.png`;

  return {
    code: 0,
    type,
    imgUrl,
  };
};
