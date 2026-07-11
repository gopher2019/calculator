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

Page({
  data: {
    accounts: [] as AccountItem[],
    summary: { accountCount: 0, charCount: 0, returningCount: 0, dueTodayCount: 0 },
    loading: false,
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
  },

  onShow() {
    this.loadAccounts();
    this.startTimer();
  },

  onHide() {
    this.clearTimer();
  },

  onUnload() {
    this.clearTimer();
  },

  noop() {},

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
      return { ...acc, characters };
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
      this.loadAccounts();
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
