// 云函数：handcraft_getUserInfo
// 功能：获取用户今日手工次数数据；若今天没有记录则自动新增一条初始化数据；返回剩余可制作次数
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const COLLECTION = 'handcraft_record';

// 获取服务器当天日期 YYYY-MM-DD（跨天判断一律以云端时间为准）
function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// 构造一条全新的当日初始记录
function buildNewRecord(openid, today) {
  return {
    _openid: openid,
    date: today,
    free_count: 1,       // 每日免费次数固定 1
    ad_gift_count: 0,    // 广告赠送次数默认 0
    ad_reward_today: false,
    total_used: 0,
  };
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const today = getToday();
  const coll = db.collection(COLLECTION);

  // 查询「当前用户 + 当天」唯一记录
  const res = await coll.where({ _openid: OPENID, date: today }).get();

  let record;
  if (res.data.length === 0) {
    // 跨天或首次进入：自动初始化当日记录（实现每日重置）
    const newRec = buildNewRecord(OPENID, today);
    await coll.add({ data: newRec });
    record = newRec;
  } else {
    record = res.data[0];
  }

  // 剩余次数 = (免费次数 + 广告赠送次数) - 今日已消耗次数（展示做非负兜底）
  const remainCount = Math.max(0, (record.free_count + record.ad_gift_count) - record.total_used);

  return {
    code: 0,
    data: {
      date: record.date,
      free_count: record.free_count,
      ad_gift_count: record.ad_gift_count,
      ad_reward_today: record.ad_reward_today,
      total_used: record.total_used,
      remainCount,
    },
  };
};
