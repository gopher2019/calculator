/**
 * 归猎录（回归 / 挂机记录）前端工具
 * 脱敏、状态文案、倒计时、云函数封装
 */

export const MAX_CHARS = 3;
export const RETURN_DURATION = 7 * 24 * 60 * 60 * 1000; // 卡回归有效期：7*24 小时

/**
 * 账号脱敏：始终返回 7 位
 *  - 长度 ≥ 4：前两位 + *** + 后两位（如 1234567 → 12***67）
 *  - 长度 < 4：真实字符在前，剩余以 * 补足 7 位（如 12 → 12*****）
 */
export function maskAccount(raw: string): string {
  const s = (raw || '').trim();
  if (s.length >= 4) {
    return s.slice(0, 2) + '***' + s.slice(-2);
  }
  return (s + '*******').slice(0, 7);
}

export function returnStateText(state: number): string {
  return state === 1 ? '卡回归中' : '正常游戏';
}

export function idleStateText(state: number): string {
  switch (state) {
    case 1:
      return '挂机中';
    case 2:
      return '已完成';
    case 3:
      return '未完成';
    default:
      return '未挂机';
  }
}

/** 卡回归剩余毫秒；≤0 表示已到期 */
export function returnRemainMs(returnStart: number | null): number {
  if (!returnStart) return 0;
  return returnStart + RETURN_DURATION - Date.now();
}

export function formatRemain(ms: number): string {
  if (ms <= 0) return '已到期';
  const totalMin = Math.floor(ms / 60000);
  const day = Math.floor(totalMin / (60 * 24));
  const hour = Math.floor((totalMin % (60 * 24)) / 60);
  const min = totalMin % 60;
  if (day > 0) return `剩 ${day} 天 ${hour} 小时`;
  if (hour > 0) return `剩 ${hour} 小时 ${min} 分`;
  return `剩 ${min} 分`;
}

export function formatDateTime(ts: number | null): string {
  if (!ts) return '-';
  const d = new Date(ts);
  const p = (n: number) => (n < 10 ? '0' + n : '' + n);
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** 云函数调用封装：成功 resolve data，失败 reject(Error) */
export function callGameRecord(
  action: string,
  data: Record<string, any> = {},
): Promise<any> {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name: 'gameRecord',
      data: { action, ...data },
      success: (res: any) => {
        const result = res.result;
        if (result && result.code === 0) {
          resolve(result.data);
        } else {
          reject(new Error((result && result.msg) || '调用失败'));
        }
      },
      fail: (err: any) => reject(err),
    });
  });
}
