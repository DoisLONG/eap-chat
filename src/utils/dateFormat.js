/**
 * 日期时间格式化工具函数
 */

/**
 * 格式化日期时间
 * @param {string|Date} dateTime - 日期时间字符串或Date对象
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期时间字符串
 */
export function formatDateTime(dateTime, format = "YYYY-MM-DD HH:mm:ss") {
  if (!dateTime) return "-";

  const date = new Date(dateTime);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return "-";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return format
    .replace("YYYY", year)
    .replace("MM", month)
    .replace("DD", day)
    .replace("HH", hours)
    .replace("mm", minutes)
    .replace("ss", seconds);
}

/**
 * 格式化为简短日期
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} 简短日期格式
 */
export function formatShortDate(dateTime) {
  return formatDateTime(dateTime, "MM-DD HH:mm");
}

/**
 * 格式化为完整日期
 * @param {string|Date} dateTime - 日期时间
 * @returns {string} 完整日期格式
 */
export function formatFullDate(dateTime) {
  return formatDateTime(dateTime, "YYYY年MM月DD日 HH:mm:ss");
}

// 默认导出常用的格式化函数
export default {
  formatDateTime,
  formatShortDate,
  formatFullDate,
};
