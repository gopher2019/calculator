/**
 * gameRecord 云函数 —— 记录游戏内「回归」与「挂机」情况
 *
 * 数据模型（均按 openid 隔离，杜绝跨用户访问）：
 *   gameAccount   : { _id, openid, account(原文), create_time, update_time }
 *   gameCharacter : { _id, openid, accountId, nickname(≤6汉字),
 *                     returnState(0正常游戏/1卡回归中), returnStart(时间戳|null),
 *                     idleState(0未挂机/1挂机中/2已完成/3未完成), create_time, update_time }
 *
 * 依赖：wx-server-sdk（部署时右键 → 创建并部署-云端安装依赖）
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });
const db = cloud.database();
const _ = db.command;

// ── 常量 ──
const MAX_CHARS = 3;                       // 每个账号最多 3 个角色
const RETURN_DURATION = 7 * 24 * 60 * 60 * 1000; // 卡回归有效期：7*24 小时
// 昵称：允许任意字符，长度不超过 6 个汉字的宽度（汉字/全角算 2，其它算 1，上限 12）
function nicknameWidth(str) {
  let w = 0;
  for (const ch of str) {
    w += /[\u4e00-\u9fa5\uff00-\uffef]/.test(ch) ? 2 : 1;
  }
  return w;
}
function isValidNickname(str) {
  return str.length > 0 && nicknameWidth(str) <= 12;
}

// 状态枚举
const RETURN = { NORMAL: 0, RETURNING: 1 };
const IDLE = { NONE: 0, RUNNING: 1, DONE: 2, UNDONE: 3 };

function ok(data) {
  return { code: 0, msg: 'ok', data };
}
function fail(msg) {
  return { code: -1, msg };
}

// ──────────────────────────────────────────────────────────
//  主入口
// ──────────────────────────────────────────────────────────
exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const openId = wxContext.OPENID;
  if (!openId) return fail('获取 openId 失败');

  const action = event.action;
  try {
    switch (action) {
      case 'listAccounts': return ok(await listAccounts(openId));
      case 'addAccount': return await addAccount(openId, event);
      case 'deleteAccount': return await deleteAccount(openId, event);
      case 'listCharacters': return ok(await listCharacters(openId, event));
      case 'addCharacter': return await addCharacter(openId, event);
      case 'deleteCharacter': return await deleteCharacter(openId, event);
      case 'setReturn': return await setReturn(openId, event);
      case 'setIdle': return await setIdle(openId, event);
      case 'resetAllIdle': return await resetAllIdle(openId);
      default: return fail('未知 action: ' + action);
    }
  } catch (err) {
    console.error('gameRecord 云函数异常:', err);
    return fail(err.message || '服务器内部错误');
  }
};

// ──────────────────────────────────────────────────────────
//  Account
// ──────────────────────────────────────────────────────────
async function listAccounts(openId) {
  const res = await db
    .collection('gameAccount')
    .where({ openid: openId })
    .orderBy('create_time', 'asc')
    .limit(1000)
    .get();

  const accounts = res.data;
  const ids = accounts.map((a) => a._id);

  // 统计每个账号的角色数
  const counts = {};
  if (ids.length) {
    const cRes = await db
      .collection('gameCharacter')
      .where({ openid: openId, accountId: _.in(ids) })
      .limit(1000)
      .get();
    cRes.data.forEach((c) => {
      counts[c.accountId] = (counts[c.accountId] || 0) + 1;
    });
  }

  const list = accounts.map((a) => ({ ...a, charCount: counts[a._id] || 0 }));
  return list;
}

async function addAccount(openId, event) {
  const account = String(event.account || '').trim();
  if (!account) return fail('账号不能为空');
  if (account.length > 30) return fail('账号过长（最多 30 位）');

  const now = Date.now();
  const res = await db.collection('gameAccount').add({
    data: { openid: openId, account, create_time: now, update_time: now },
  });
  return ok({ _id: res._id });
}

async function deleteAccount(openId, event) {
  const accountId = event.accountId;
  if (!accountId) return fail('缺少 accountId');
  // 级联删除该账号下所有角色
  await db
    .collection('gameCharacter')
    .where({ openid: openId, accountId })
    .remove();
  await db
    .collection('gameAccount')
    .where({ _id: accountId, openid: openId })
    .remove();
  return ok({});
}

// ──────────────────────────────────────────────────────────
//  Character
// ──────────────────────────────────────────────────────────
async function listCharacters(openId, event) {
  const accountId = event.accountId;
  if (!accountId) return fail('缺少 accountId');

  const res = await db
    .collection('gameCharacter')
    .where({ openid: openId, accountId })
    .orderBy('create_time', 'asc')
    .limit(1000)
    .get();
  return res.data;
}

async function addCharacter(openId, event) {
  const accountId = event.accountId;
  const nickname = String(event.nickname || '').trim();

  if (!accountId) return fail('缺少 accountId');
  if (!isValidNickname(nickname)) return fail('昵称长度不能超过 6 个汉字');

  // 校验账号归属
  const accRes = await db
    .collection('gameAccount')
    .where({ _id: accountId, openid: openId })
    .get();
  if (!accRes.data || accRes.data.length === 0) return fail('账号不存在');

  // 校验角色上限
  const cntRes = await db
    .collection('gameCharacter')
    .where({ openid: openId, accountId })
    .count();
  if (cntRes.total >= MAX_CHARS) {
    return fail('每个账号最多添加 ' + MAX_CHARS + ' 个角色');
  }

  const now = Date.now();
  const res = await db.collection('gameCharacter').add({
    data: {
      openid: openId,
      accountId,
      nickname,
      returnState: RETURN.NORMAL,
      returnStart: null,
      idleState: IDLE.NONE,
      create_time: now,
      update_time: now,
    },
  });
  return ok({ _id: res._id });
}

async function deleteCharacter(openId, event) {
  const characterId = event.characterId;
  if (!characterId) return fail('缺少 characterId');
  await db
    .collection('gameCharacter')
    .where({ _id: characterId, openid: openId })
    .remove();
  return ok({});
}

// ── 卡回归：设置状态 + 回归开始时间 ──
async function setReturn(openId, event) {
  const characterId = event.characterId;
  const returnState = Number(event.returnState);

  if (!characterId) return fail('缺少 characterId');
  if (returnState !== RETURN.NORMAL && returnState !== RETURN.RETURNING) {
    return fail('非法的卡回归状态');
  }

  const data = { returnState, update_time: Date.now() };
  if (returnState === RETURN.RETURNING) {
    // 卡回归中：记录开始时间（可手动指定），用于计算 7*24h 到期
    data.returnStart = event.returnStart ? Number(event.returnStart) : Date.now();
  } else {
    // 取消回归：清空开始时间
    data.returnStart = null;
  }

  await db
    .collection('gameCharacter')
    .where({ _id: characterId, openid: openId })
    .update({ data });
  return ok({});
}

// ── 挂机：设置状态（卡回归中禁止） ──
async function setIdle(openId, event) {
  const characterId = event.characterId;
  const idleState = Number(event.idleState);

  if (!characterId) return fail('缺少 characterId');
  if (![IDLE.NONE, IDLE.RUNNING, IDLE.DONE, IDLE.UNDONE].includes(idleState)) {
    return fail('非法的挂机状态');
  }

  // 卡回归中不可挂机
  const cRes = await db
    .collection('gameCharacter')
    .where({ _id: characterId, openid: openId })
    .get();
  if (!cRes.data || cRes.data.length === 0) return fail('角色不存在');
  if (cRes.data[0].returnState === RETURN.RETURNING) {
    return fail('卡回归中不可挂机');
  }

  await db
    .collection('gameCharacter')
    .where({ _id: characterId, openid: openId })
    .update({ data: { idleState, update_time: Date.now() } });
  return ok({});
}

// ── 一键重置：当前用户所有角色置为「未挂机」 ──
async function resetAllIdle(openId) {
  await db
    .collection('gameCharacter')
    .where({ openid: openId })
    .update({ data: { idleState: IDLE.NONE, update_time: Date.now() } });
  return ok({});
}

// 暴露常量给前端（不强制，仅备用）
exports.RETURN_DURATION = RETURN_DURATION;
exports.MAX_CHARS = MAX_CHARS;
