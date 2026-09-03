// 云函数：handcraft_make
// 功能：执行「制作」操作；校验剩余次数是否充足；充足则 total_used 自增 +1；不足返回 code=-2
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const COLLECTION = 'handcraft_record';

function getToday() {
  // 云函数默认时区为 UTC，需换算为北京时间（UTC+8）后再取日期，避免跨天边界错乱（否则每日 08:00 才重置）
  const beijing = new Date(Date.now() + 8 * 60 * 60 * 1000);
  const y = beijing.getUTCFullYear();
  const m = String(beijing.getUTCMonth() + 1).padStart(2, '0');
  const day = String(beijing.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildNewRecord(openid, today) {
  return {
    _openid: openid,
    date: today,
    free_count: 1,
    ad_gift_count: 0,
    ad_reward_today: false,
    total_used: 0,
  };
}

exports.main = async (event, context) => {
  const { OPENID } = cloud.getWXContext();
  const today = getToday();
  const coll = db.collection(COLLECTION);

  const res = await coll.where({ _openid: OPENID, date: today }).get();

  let record;
  if (res.data.length === 0) {
    const newRec = buildNewRecord(OPENID, today);
    await coll.add({ data: newRec });
    record = newRec;
  } else {
    record = res.data[0];
  }

  // 服务端校验剩余次数，前端禁止直接改次数
  const remainCount = (record.free_count + record.ad_gift_count) - record.total_used;
  if (remainCount <= 0) {
    return { code: -2, msg: '制作次数不足' };
  }

  // 扣减 1 次（使用服务端自增，保证并发安全）
  await coll.doc(record._id).update({
    data: { total_used: _.inc(1) },
  });

  return { code: 0 };
};
