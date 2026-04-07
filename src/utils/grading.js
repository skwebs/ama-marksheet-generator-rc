/**
 * Calculate grade based on obtained marks and full marks.
 * @param {number} obtained
 * @param {number} full
 * @returns {string}
 */
export function calcGrade(obtained, full) {
  if (!full) return '-'
  const pct = (obtained / full) * 100
  if (pct >= 91) return 'A+'
  if (pct >= 81) return 'A'
  if (pct >= 71) return 'B+'
  if (pct >= 61) return 'B'
  if (pct >= 51) return 'C+'
  if (pct >= 41) return 'C'
  if (pct >= 33) return 'D'
  return 'E'
}

/**
 * Safely parse a number from any value.
 */
export function parseNum(v) {
  const n = parseFloat(v)
  return isNaN(n) ? 0 : n
}

/**
 * Format a date value from Excel (Date object or string) to DD-MM-YYYY.
 */
export function fmtDate(val) {
  if (!val && val !== 0) return ''
  if (val instanceof Date) {
    return [
      String(val.getDate()).padStart(2, '0'),
      String(val.getMonth() + 1).padStart(2, '0'),
      val.getFullYear(),
    ].join('-')
  }
  return String(val)
}

/**
 * Today's date as DD-MM-YYYY string.
 */
export function todayString() {
  const d = new Date()
  return [
    String(d.getDate()).padStart(2, '0'),
    String(d.getMonth() + 1).padStart(2, '0'),
    d.getFullYear(),
  ].join('-')
}
