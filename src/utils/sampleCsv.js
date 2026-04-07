/**
 * Generate and trigger download of a sample CSV based on configured subjects.
 * @param {Array<{name: string, key: string}>} subjects
 */
export function downloadSampleCSV(subjects) {
  const subjectCols = subjects.flatMap((s) => [`${s.key}_written`, `${s.key}_oral`])
  const vals1 = subjects.flatMap(() => ['72', '18'])
  const vals2 = subjects.flatMap(() => ['85', '12'])

  const headers = [
    'name', 'mother', 'father', 'class', 'section', 'roll',
    'dob', 'address', ...subjectCols, 'attendance', 'position', 'remarks',
  ]

  const row1 = [
    'Rahul Kumar', 'Sunita Devi', 'Rajesh Kumar', 'V', 'A', '1',
    '15-06-2015', 'Village Rajapakar Vaishali', ...vals1, '220', '2', 'Good student',
  ]

  const row2 = [
    'Priya Singh', 'Anita Singh', 'Suresh Singh', 'V', 'A', '2',
    '22-03-2015', 'Ward No. 3 Vaishali', ...vals2, '215', '1', 'Excellent performance',
  ]

  const csv = [headers, row1, row2].map((r) => r.join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
  const a   = Object.assign(document.createElement('a'), {
    href: url,
    download: 'marksheet_sample.csv',
  })
  a.click()
  URL.revokeObjectURL(url)
}

/**
 * Normalize a subject name to a safe key (same logic as parseFile.js).
 */
export const normKey = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '')
