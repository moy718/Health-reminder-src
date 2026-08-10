/**
 * i18n 国际化核心模块
 */

import zhCN from './zh-CN.js';
import enUS from './en-US.js';

const locales = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

let currentLocale = 'zh-CN';
let currentMessages = locales[currentLocale];

/**
 * 设置当前语言
 * @param {string} locale - 语言代码 ('zh-CN' | 'en-US')
 */
export function setLocale(locale) {
  if (locales[locale]) {
    currentLocale = locale;
    currentMessages = locales[locale];
    // 触发自定义事件通知语言变更
    window.dispatchEvent(new CustomEvent('locale-changed', { detail: { locale } }));
  }
}

/**
 * 获取当前语言
 * @returns {string}
 */
export function getLocale() {
  return currentLocale;
}

/**
 * 获取所有支持的语言列表
 * @returns {Array<{code: string, name: string}>}
 */
export function getSupportedLocales() {
  return [
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en-US', name: 'English' },
  ];
}

/**
 * 获取翻译文本
 * @param {string} key - 翻译键，支持点号分隔的嵌套路径
 * @param {Object} params - 插值参数
 * @returns {string}
 */
export function t(key, params = {}) {
  const keys = key.split('.');
  let value = currentMessages;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      // 如果找不到翻译，返回 key 本身作为 fallback
      console.warn(`Missing translation for key: ${key}`);
      return key;
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // 处理插值 {paramName}
  return value.replace(/\{(\w+)\}/g, (match, paramName) => {
    return params[paramName] !== undefined ? params[paramName] : match;
  });
}

/**
 * 根据浏览器语言自动检测并设置语言
 */
export function detectLocale() {
  const browserLang = navigator.language || navigator.userLanguage;
  if (browserLang.startsWith('zh')) {
    return 'zh-CN';
  }
  return 'en-US';
}

export default {
  t,
  setLocale,
  getLocale,
  getSupportedLocales,
  detectLocale,
};
