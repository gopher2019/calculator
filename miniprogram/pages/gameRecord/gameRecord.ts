import {
  callGameRecord,
  maskAccount,
  returnStateText,
  idleStateText,
  returnRemainMs,
  formatRemain,
  MAX_CHARS,
  RETURN_DURATION,
} from '../../utils/gameRecord';
import { shareConfig, enableShareMenu } from '../../utils/share';

interface CharItem {
  _id: string;
  nickname: string;
  returnState: number;
  returnStart: number | null;
  idleState: number;
  returnText: string;
  returnRemain: string;
  returnExpired: boolean;
  returnSoon: boolean;
  idleText: string;
  canIdle: boolean;
}

interface AccountItem {
  _id: string;
  account: string;
  masked: string;
  charCount: number;
  expanded: boolean;
  characters: CharItem[];
  addDisabled: boolean;
  hasExpired: boolean;
}

// 时分两列数据（multiSelector 用）
function buildTimeColumns(): string[][] {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const hours = Array.from({ length: 24 }, (_, i) => pad(i));
  const minutes = Array.from({ length: 60 }, (_, i) => pad(i));
  return [hours, minutes];
}

// ── 收藏小程序轻引导 ──
const FAV_KEY_LAST = 'fav_hint_last_shown';
const FAV_COOLDOWN = 7 * 24 * 60 * 60 * 1000;
const FAV_HINT_TEXT =
  '担心7天后找不到回归计时工具？点击右上角【···】→ 添加到「我的小程序」，下拉微信快速打开！';
// 同一小程序会话内，避免连续添加多个账号时重复弹出引导
let favHintShownThisSession = false;
// 浮窗展示满8秒无操作自动关闭的定时器
let favHintTimer: number | null = null;
const FAV_AUTO_CLOSE_DELAY = 8 * 1000;

Page({
  ...shareConfig,

  data: {
    accounts: [] as AccountItem[],
    summary: { accountCount: 0, charCount: 0, returningCount: 0, dueTodayCount: 0 },
    loading: false,
    showHelp: false,
    showAdd: false,
    newAccount: '',
    // 添加角色弹窗
    showAddChar: false,
    newChar: '',
    activeAccountId: '',
    // 修改回归开始时间弹窗
    showDatePicker: false,
    editingCharId: '',
    pickerDate: '',
    timeColumns: buildTimeColumns(),
    timeIndex: [0, 0] as number[],
    // 下拉选项
    returnRange: ['正常游戏', '卡回归中'],
    idleRange: ['未挂机', '挂机中', '已完成', '未完成'],
    // 收藏小程序轻引导
    showFavHint: false,
    favHintText: FAV_HINT_TEXT,
    // 底部悬浮广告位真实高度（rpx），广告加载后实测并动态预留底部空间
    adReserve: 0,
  },

  onLoad() {
    enableShareMenu();
  },

  onShow() {
    this.loadAccounts();
    this.startTimer();
    // 从其他页返回时，若浮窗仍展示则续接8秒自动关闭
    if (this.data.showFavHint && favHintTimer === null) {
      favHintTimer = setTimeout(() => this.closeFavHint(), FAV_AUTO_CLOSE_DELAY) as any;
    }
  },

  onHide() {
    this.clearTimer();
    if (favHintTimer) {
      clearTimeout(favHintTimer);
      favHintTimer = null;
    }
  },

  onUnload() {
    this.clearTimer();
    if (favHintTimer) {
      clearTimeout(favHintTimer);
      favHintTimer = null;
    }
  },

  noop() {},

  // 底部悬浮广告加载成功：原生模板广告会先占位（偏高）再收缩到真实高度，
  // 故多次实测、以最终稳定高度为准，避免预留过高导致广告上方留白
  onAdLoad() {
    const measure = () => {
      wx.createSelectorQuery()
        .in(this)
        .select('.ad-slot')
        .boundingClientRect((rect: WechatMiniprogram.BoundingClientRectCallbackResult | undefined) => {
          if (!rect || !rect.height) return;
          const winWidth = wx.getSystemInfoSync().windowWidth;
          const rpx = Math.ceil((rect.height * 750) / winWidth);
          this.setData({ adReserve: rpx });
        })
        .exec();
    };
    // 200ms 起的几个时点测量，最后一次（稳定态）覆盖早期偏高的占位高度
    [200, 500, 1000, 1800].forEach((delay) => setTimeout(measure, delay));
  },

  // 广告加载失败：不预留空间，避免底部留白
  onAdError() {
    this.setData({ adReserve: 0 });
  },

  // ── 收藏小程序轻引导 ──
  favMarkShown() {
    wx.setStorageSync(FAV_KEY_LAST, Date.now());
  },

  // 场景2：回访老用户（已有账号，距上次展示≥7天）
  checkReturnVisitHint() {
    const accounts = this.data.accounts || [];
    if (accounts.length === 0) return;
    const last = wx.getStorageSync(FAV_KEY_LAST);
    if (last && Date.now() - last < FAV_COOLDOWN) return;
    this.showFavHint();
  },

  // 场景1：新建账号成功（高优先级，绕过冷却；会话内不重复）
  showFavHintForNewAccount() {
    if (favHintShownThisSession) return;
    this.showFavHint();
  },

  showFavHint() {
    if (this.data.showFavHint) return;
    this.setData({ showFavHint: true });
    this.favMarkShown();
    favHintShownThisSession = true;
    // 展示满8秒且用户无操作则自动关闭
    if (favHintTimer) clearTimeout(favHintTimer);
    favHintTimer = setTimeout(() => {
      this.closeFavHint();
    }, FAV_AUTO_CLOSE_DELAY) as any;
  },

  // 用户点击关闭：仅隐藏浮窗，不重复写入存储（曝光时间戳已在展示时记录）
  closeFavHint() {
    if (favHintTimer) {
      clearTimeout(favHintTimer);
      favHintTimer = null;
    }
    this.setData({ showFavHint: false });
  },

  // ── 使用说明文档 ──
  openHelp() {
    this.setData({ showHelp: true });
  },

  closeHelp() {
    this.setData({ showHelp: false });
  },

  // 给角色对象补充展示字段
  decorate(raw: any) {
    const remain = returnRemainMs(raw.returnStart);
    const DAY = 24 * 60 * 60 * 1000;
    return {
      ...raw,
      returnText: returnStateText(raw.returnState),
      returnRemain: raw.returnState === 1 ? formatRemain(remain) : '',
      returnExpired: raw.returnState === 1 && remain <= 0,
      returnSoon: raw.returnState === 1 && remain > 0 && remain < DAY,
      idleText: idleStateText(raw.idleState),
      canIdle: raw.returnState === 0,
    };
  },

  // 局部更新单个角色（不依赖云函数返回，直接用本地新值 patch）
  patchCharacter(id: string, patch: Record<string, any>) {
    const accounts = this.data.accounts.map((acc) => {
      const idx = acc.characters.findIndex((c) => c._id === id);
      if (idx === -1) return acc;
      const merged = { ...acc.characters[idx], ...patch };
      const characters = acc.characters.slice();
      characters[idx] = this.decorate(merged);
      return { ...acc, characters, hasExpired: characters.some((c) => c.returnExpired) };
    });
    this.setData({ accounts });
    this.refreshSummary();
  },

  async loadAccounts() {
    this.setData({ loading: true });
    try {
      const list = (await callGameRecord('listAccounts')) as any[];
      const accounts = await Promise.all(
        (list || []).map(async (a: any) => {
          let characters: CharItem[] = [];
          try {
            const chars = (await callGameRecord('listCharacters', { accountId: a._id })) as any[];
            characters = (chars || []).map((c) => this.decorate(c));
          } catch (e) {
            // 单个账号拉角色失败不影响整体
          }
          return {
            _id: a._id,
            account: a.account,
            masked: maskAccount(a.account),
            charCount: a.charCount || characters.length,
            expanded: false,
            characters,
            addDisabled: characters.length >= MAX_CHARS,
            hasExpired: characters.some((c) => c.returnExpired),
          };
        }),
      );
      this.setData({ accounts });
      this.refreshSummary();
    } catch (err: any) {
      wx.showToast({ title: err.message || '加载失败', icon: 'none' });
    } finally {
      this.setData({ loading: false });
      this.checkReturnVisitHint();
    }
  },

  // 汇总统计：总账号/总角色/卡回归中/今日到期
  refreshSummary() {
    if (!this.data || !this.data.accounts) return;
    let accountCount = this.data.accounts.length;
    let charCount = 0;
    let returningCount = 0;
    let dueTodayCount = 0;
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const todayStart = startOfToday.getTime();
    const todayEnd = endOfToday.getTime();
    this.data.accounts.forEach((acc) => {
      acc.characters.forEach((ch) => {
        charCount++;
        if (ch.returnState === 1) {
          returningCount++;
          if (ch.returnStart) {
            const expire = ch.returnStart + RETURN_DURATION;
            if (expire >= todayStart && expire <= todayEnd) dueTodayCount++;
          }
        }
      });
    });
    this.setData({ summary: { accountCount, charCount, returningCount, dueTodayCount } });
  },

  // 每分钟刷新一次倒计时（仅刷新已展开账号的角色）
  startTimer() {
    this.clearTimer();
    (this as any)._timer = setInterval(() => {
      try {
        if (!this.data || !this.data.accounts) return;
        const accounts = this.data.accounts.map((acc) => ({
          ...acc,
          hasExpired: acc.characters.some((c) => c.returnExpired),
          characters: acc.expanded
            ? acc.characters.map((c) => this.decorate(c))
            : acc.characters,
        }));
        this.setData({ accounts });
        this.refreshSummary();
      } catch (e) {
        // 单次异常不应导致页面崩溃白屏
        console.error('回归与挂机设置 定时器刷新异常', e);
      }
    }, 60000) as any;
  },

  clearTimer() {
    const t = (this as any)._timer;
    if (t !== null && t !== undefined) {
      clearInterval(t);
      (this as any)._timer = null;
    }
  },

  // ── 折叠：点击账号展开/收起 ──
  toggleAccount(e: any) {
    const id = e.currentTarget.dataset.id;
    const accounts = this.data.accounts.map((a) => ({
      ...a,
      expanded: a._id === id ? !a.expanded : a.expanded,
    }));
    this.setData({ accounts });
  },

  // ── 一键重置今日挂机 ──
  resetTodayIdle() {
    wx.showModal({
      title: '一键重置',
      content: '确认将所有角色重置为「未挂机」状态？',
      success: async (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: '处理中' });
        try {
          await callGameRecord('resetAllIdle');
          wx.showToast({ title: '已重置', icon: 'success' });
          this.loadAccounts();
        } catch (err: any) {
          wx.showToast({ title: err.message || '重置失败', icon: 'none' });
        } finally {
          wx.hideLoading();
        }
      },
    });
  },

  // ── 回归状态下拉 ──
  async onReturnChange(e: any) {
    const id = e.currentTarget.dataset.id;
    const state = Number(e.detail.value);
    wx.showLoading({ title: '处理中' });
    try {
      await callGameRecord('setReturn', { characterId: id, returnState: state });
      this.patchCharacter(id, {
        returnState: state,
        returnStart: state === 1 ? Date.now() : null,
      });
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onEditReturnStart(e: any) {
    const id = e.currentTarget.dataset.id;
    const acc = this.data.accounts.find((a) => a.characters.some((c) => c._id === id));
    const ch = acc ? acc.characters.find((c) => c._id === id) : null;
    const base = ch && ch.returnStart ? new Date(ch.returnStart) : new Date();
    const p = (n: number) => (n < 10 ? '0' + n : '' + n);
    const pickerDate = `${base.getFullYear()}-${p(base.getMonth() + 1)}-${p(base.getDate())}`;
    const timeIndex = [base.getHours(), base.getMinutes()];
    this.setData({ showDatePicker: true, editingCharId: id, pickerDate, timeIndex });
  },

  onDatePickerChange(e: any) {
    this.setData({ pickerDate: e.detail.value });
  },

  onTimePickerChange(e: any) {
    this.setData({ timeIndex: e.detail.value });
  },

  async confirmDate() {
    const id = this.data.editingCharId;
    const [hi, mi] = this.data.timeIndex;
    const p = (n: number) => (n < 10 ? '0' + n : '' + n);
    const ts = new Date(
      `${this.data.pickerDate} ${p(hi)}:${p(mi)}:00`,
    ).getTime();
    wx.showLoading({ title: '处理中' });
    try {
      await callGameRecord('setReturn', {
        characterId: id,
        returnState: 1,
        returnStart: ts,
      });
      this.setData({ showDatePicker: false });
      this.patchCharacter(id, { returnState: 1, returnStart: ts });
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  closeDatePicker() {
    this.setData({ showDatePicker: false });
  },

  // ── 挂机状态下拉 ──
  async onIdleChange(e: any) {
    const id = e.currentTarget.dataset.id;
    const state = Number(e.detail.value);
    wx.showLoading({ title: '处理中' });
    try {
      await callGameRecord('setIdle', { characterId: id, idleState: state });
      this.patchCharacter(id, { idleState: state });
    } catch (err: any) {
      wx.showToast({ title: err.message || '操作失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // ── 添加角色 ──
  openAddChar(e: any) {
    const id = e.currentTarget.dataset.id;
    const acc = this.data.accounts.find((a) => a._id === id);
    if (acc && acc.addDisabled) {
      wx.showToast({ title: `最多 ${MAX_CHARS} 个角色`, icon: 'none' });
      return;
    }
    this.setData({ showAddChar: true, newChar: '', activeAccountId: id });
  },

  closeAddChar() {
    this.setData({ showAddChar: false, newChar: '' });
  },

  onCharInput(e: any) {
    this.setData({ newChar: e.detail.value });
  },

  async confirmAddChar() {
    const nickname = (this.data.newChar || '').trim();
    // 宽度校验：汉字/全角算 2，其它算 1，上限 12（即 6 个汉字的长度）
    const width = Array.from(nickname).reduce(
      (w, ch) => w + (/[\u4e00-\u9fa5\uff00-\uffef]/.test(ch) ? 2 : 1),
      0,
    );
    if (nickname.length === 0 || width > 12) {
      wx.showToast({ title: '昵称长度不能超过 6 个汉字', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '添加中' });
    try {
      await callGameRecord('addCharacter', {
        accountId: this.data.activeAccountId,
        nickname,
      });
      this.setData({ showAddChar: false, newChar: '' });
      wx.showToast({ title: '已添加', icon: 'success' });
      this.loadAccounts();
    } catch (err: any) {
      wx.showToast({ title: err.message || '添加失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // ── 删除角色 ──
  onDeleteChar(e: any) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '删除角色',
      content: '确认删除该角色？',
      confirmColor: '#e74c3c',
      success: async (res) => {
        if (res.confirm) {
          try {
            await callGameRecord('deleteCharacter', { characterId: id });
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadAccounts();
          } catch (err: any) {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      },
    });
  },

  // ── 账号 ──
  openAdd() {
    this.setData({ showAdd: true, newAccount: '' });
  },

  closeAdd() {
    this.setData({ showAdd: false, newAccount: '' });
  },

  onAccountInput(e: any) {
    this.setData({ newAccount: e.detail.value });
  },

  async confirmAdd() {
    const account = (this.data.newAccount || '').trim();
    if (!account) {
      wx.showToast({ title: '请输入账号', icon: 'none' });
      return;
    }
    try {
      await callGameRecord('addAccount', { account });
      this.setData({ showAdd: false, newAccount: '' });
      wx.showToast({ title: '已添加', icon: 'success' });
      await this.loadAccounts();
      this.showFavHintForNewAccount();
    } catch (err: any) {
      wx.showToast({ title: err.message || '添加失败', icon: 'none' });
    }
  },

  onDeleteAccount(e: any) {
    const id = e.currentTarget.dataset.id;
    const masked = e.currentTarget.dataset.masked;
    wx.showModal({
      title: '删除账号',
      content: `确认删除账号 ${masked}？其下角色将一并删除。`,
      confirmColor: '#e74c3c',
      success: async (res) => {
        if (res.confirm) {
          try {
            await callGameRecord('deleteAccount', { accountId: id });
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadAccounts();
          } catch (err: any) {
            wx.showToast({ title: err.message || '删除失败', icon: 'none' });
          }
        }
      },
    });
  },
});
