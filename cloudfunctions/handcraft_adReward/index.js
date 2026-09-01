// 云函数：handcraft_adReward
// 功能：看完激励广告后领取奖励；仅当今日未领取（ad_reward_today=false）才发放 5 次；
//      设置 ad_gift_count=5、ad_reward_today=true；当天已领取返回 code=-3
const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();
const _ = db.command;
const COLLECTION = 'handcraft_record';

function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
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

  // 服务端校验：今天已领过则拒绝重复发放
  if (record.ad_reward_today) {
    return { code: -3, msg: '今日已经领取过广告奖励' };
  }

  // 在原有广告赠送次数基础上 +5（使用自增，避免覆盖掉已存在的次数）
  await coll.doc(record._id).update({
    data: {
      ad_gift_count: _.inc(5),
      ad_reward_today: true,
    },
  });

  return { code: 0 };
};
