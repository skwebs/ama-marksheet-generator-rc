/**
 * parseFile.js
 *
 * Replaces the vulnerable `xlsx` package with:
 *   - exceljs  → .xlsx / .xls parsing (no known vulnerabilities)
 *   - papaparse → .csv parsing (fast, battle-tested)
 *
 * API is identical to the old parseFile.js so no other files need changes.
 */

import ExcelJS from 'exceljs'
import Papa from 'papaparse'
import { fmtDate, parseNum } from './grading.js'

/** Normalize a string for flexible column-name matching */
const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')

/** Find a column header matching any of the variant names */
function detectCol(headers, ...variants) {
  const targets = variants.map(norm)
  return headers.find((h) => targets.includes(norm(h))) || null
}

// ─────────────────────────────────────────────────────────────
//  Excel parser  (.xlsx / .xls)
// ─────────────────────────────────────────────────────────────

async function parseExcel(buffer) {
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer)

  const worksheet = workbook.worksheets[0]
  if (!worksheet) throw new Error('No worksheets found in the file.')

  const rawRows = []
  let headers = []

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) {
      // First row → headers
      headers = row.values
        .slice(1)                              // exceljs row.values is 1-indexed
        .map((v) => String(v ?? '').trim())
      return
    }

    // Data rows → build plain object
    const obj = {}
    headers.forEach((header, i) => {
      const cell = row.getCell(i + 1)
      // exceljs returns Date objects for date cells
      obj[header] = cell.value instanceof Date ? cell.value : (cell.value ?? '')
    })
    rawRows.push(obj)
  })

  return { headers, rawRows }
}

// ─────────────────────────────────────────────────────────────
//  CSV parser  (.csv)
// ─────────────────────────────────────────────────────────────

async function parseCsv(buffer) {
  const text = new TextDecoder('utf-8').decode(buffer)
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: false,   // keep everything as string; we parse numbers ourselves
  })

  if (result.errors.length) {
    const fatal = result.errors.find((e) => e.type === 'Delimiter' || e.type === 'FieldMismatch')
    if (fatal) throw new Error(`CSV parse error: ${fatal.message}`)
  }

  const headers = result.meta.fields ?? []
  const rawRows = result.data

  return { headers, rawRows }
}

// ─────────────────────────────────────────────────────────────
//  Shared: map raw rows → typed student objects
// ─────────────────────────────────────────────────────────────

function mapStudents(rawRows, headers, subjects) {
  const cols = {
    name:       detectCol(headers, 'name', 'studentname', 'student name', 'student'),
    mother:     detectCol(headers, 'mother', 'mothersname', "mother's name", 'mothername'),
    father:     detectCol(headers, 'father', 'fathersname', "father's name", 'fathername'),
    class:      detectCol(headers, 'class', 'grade', 'std', 'classname'),
    section:    detectCol(headers, 'section', 'sec', 'div', 'division'),
    roll:       detectCol(headers, 'roll', 'rollno', 'roll no', 'rollnumber', 'roll number'),
    dob:        detectCol(headers, 'dob', 'dateofbirth', 'date of birth', 'birthdate'),
    address:    detectCol(headers, 'address', 'addr', 'residence'),
    attendance: detectCol(headers, 'attendance', 'attend', 'days', 'presentdays'),
    position:   detectCol(headers, 'position', 'rank', 'pos', 'classposition', 'class position'),
    remarks:    detectCol(headers, 'remarks', 'remark', 'comment', 'note', 'notes'),
  }

  const missing = ['name', 'mother', 'father', 'class', 'roll'].filter((k) => !cols[k])
  if (missing.length) {
    return { students: [], error: `Required columns not found: ${missing.join(', ')}` }
  }

  const students = rawRows
    .map((r) => {
      // Per-subject marks
      const subjectMarks = {}
      subjects.forEach((s) => {
        const find = (suffix) => headers.find((h) => norm(h) === s.key + suffix) || null
        const fullCol    = find('full')
        const writtenCol = find('written')
        const oralCol    = find('oral')

        const full    = parseNum(fullCol    ? r[fullCol]    : null) || 100
        const written = parseNum(writtenCol ? r[writtenCol] : 0)
        const oral    = parseNum(oralCol    ? r[oralCol]    : 0)

        subjectMarks[s.key] = { full, written, oral }
      })

      return {
        name:       String(r[cols.name]       || '').trim(),
        mother:     String(r[cols.mother]     || '').trim(),
        father:     String(r[cols.father]     || '').trim(),
        class:      String(r[cols.class]      || '').trim(),
        section:    cols.section    ? String(r[cols.section]    || '').trim() : '',
        roll:       String(r[cols.roll]       || '').trim(),
        dob:        cols.dob        ? fmtDate(r[cols.dob])                   : '',
        address:    cols.address    ? String(r[cols.address]    || '').trim() : '',
        attendance: cols.attendance ? String(r[cols.attendance] || '').trim() : '',
        position:   cols.position   ? String(r[cols.position]   || '').trim() : '',
        remarks:    cols.remarks    ? String(r[cols.remarks]    || '').trim() : '',
        subjectMarks,
      }
    })
    .filter((s) => s.name)

  return { students, error: null }
}

// ─────────────────────────────────────────────────────────────
//  Public API
// ─────────────────────────────────────────────────────────────

/**
 * Parse an Excel (.xlsx/.xls) or CSV file from an ArrayBuffer.
 * Returns { students, error }.
 *
 * @param {ArrayBuffer} buffer
 * @param {string}      fileName  - used to decide xlsx vs csv path
 * @param {Array<{name:string, key:string}>} subjects
 */
export async function parseStudentFile(buffer, fileName, subjects) {
  try {
    const isCsv = /\.csv$/i.test(fileName)
    const { headers, rawRows } = isCsv
      ? await parseCsv(buffer)
      : await parseExcel(buffer)

    if (!rawRows.length) return { students: [], error: 'File appears to be empty.' }

    return mapStudents(rawRows, headers, subjects)
  } catch (err) {
    return { students: [], error: err.message }
  }
}

/**
 * Read a File as ArrayBuffer.
 */
export function readFileAsBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('File read failed'))
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Read an image File as Data URL.
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload  = (e) => resolve(e.target.result)
    reader.onerror = () => reject(new Error('Image read failed'))
    reader.readAsDataURL(file)
  })
}
