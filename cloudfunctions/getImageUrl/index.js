/**
 * getImageUrl 云函数 —— 以管理员身份获取云存储临时下载地址
 *
 * 背景：
 *   免费 TCB 环境存储 ACL 锁死为私有（STORAGE_EXCEED_AUTHORITY），
 *   前端直接调用 wx.cloud.getTempFileURL 会返回空 tempFileURL。
 *   云函数运行在服务端，使用 cloud.DYNAMIC_CURRENT_ENV 以「管理员」
 *   身份访问存储，可正常换取临时下载 URL，再回传给前端展示。
 *
 * 入参（event）：
 *   fileList: string | string[]   —— 单个 fileID 或 fileID 数组
 *
 * 返回：
 *   {
 *     code: 0,
 *     msg: 'ok',
 *     list: [ { fileID, tempFileURL, status, errMsg } , ... ]  // 与官方结构一致
 *   }
 *   失败：{ code: -1, msg: '...' }
 *
 * 依赖：仅 wx-server-sdk（部署时右键 → 创建并部署-云端安装依赖）
 */
const cloud = require('wx-server-sdk');

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

exports.main = async (event, context) => {
  try {
    // 统一为数组
    let fileList = event.fileList;
    if (typeof fileList === 'string') {
      fileList = [fileList];
    }
    if (!Array.isArray(fileList) || fileList.length === 0) {
      return { code: -1, msg: 'fileList 不能为空' };
    }
    // 上限保护（官方单次限制 50 个）
    if (fileList.length > 50) {
      return { code: -1, msg: 'fileList 单次最多 50 个' };
    }

    const res = await cloud.getTempFileURL({ fileList });

    // res.fileList 每一项含 fileID / tempFileURL / status / errMsg
    return {
      code: 0,
      msg: 'ok',
      list: res.fileList || [],
    };
  } catch (err) {
    console.error('getImageUrl 云函数异常:', err);
    return {
      code: -1,
      msg: err.message || '服务器内部错误',
    };
  }
};
