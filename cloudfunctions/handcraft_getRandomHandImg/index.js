// 云函数：handcraft_getRandomHandImg
// 功能：随机生成 1~104 的整数，返回对应的云存储图片 fileID；鉴定不消耗次数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 成品图片在云存储中的目录前缀（编号 1~104 对应 1.png ~ 104.png）
// 若你的实际目录结构不同，只需修改此处前缀即可（后缀统一为 .png）
const FILEID_PREFIX =
  'cloud://cloud1-d8ghq1ib583e14043.636c-cloud1-d8ghq1ib583e14043-1452712403/images/shougong/xianglian/85/';

const TOTAL = 104; // 成品图片总数

exports.main = async (event, context) => {
  // 生成 [1, TOTAL] 闭区间随机整数
  const n = Math.floor(Math.random() * TOTAL) + 1;
  const imgUrl = `${FILEID_PREFIX}${n}.png`;

  return {
    code: 0,
    imgUrl,
  };
};
