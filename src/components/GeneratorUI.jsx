import { useRef } from 'react'
import { normKey, downloadSampleCSV } from '../utils/sampleCsv.js'
import { parseStudentFile, readFileAsBuffer, readFileAsDataURL } from '../utils/parseFile.js'

/** Small status badge component */
function StatusBadge({ status }) {
  if (!status) return null
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error:   'bg-red-50   text-red-700   border-red-200',
    info:    'bg-blue-50  text-blue-700  border-blue-200',
  }
  return (
    <div className={`flex items-center gap-2 mt-2 px-3 py-2 rounded-full text-xs font-semibold border ${styles[status.type]}`}
      dangerouslySetInnerHTML={{ __html: status.message }}
    />
  )
}

/**
 * GeneratorUI — the non-printable control panel.
 *
 * @param {{
 *   examType: string, setExamType: fn,
 *   session: string,  setSession: fn,
 *   signDate: string, setSignDate: fn,
 *   subjectsRaw: string, setSubjectsRaw: fn,
 *   students: Array, setStudents: fn,
 *   imageMap: object, setImageMap: fn,
 *   onGenerate: fn,
 *   onPrint: fn,
 *   onClear: fn,
 *   cardsCount: number,
 *   canGenerate: boolean,
 *   canPrint: boolean,
 *   dataStatus: object|null,
 *   photoStatus: object|null,
 *   subjectPreview: object|null,
 *   setDataStatus: fn,
 *   setPhotoStatus: fn,
 *   setSubjectPreview: fn,
 * }} props
 */
export default function GeneratorUI({
  examType, setExamType,
  session,  setSession,
  signDate, setSignDate,
  subjectsRaw, setSubjectsRaw,
  setStudents,
  setImageMap,
  onGenerate, onPrint, onClear,
  cardsCount,
  canGenerate, canPrint,
  dataStatus,  setDataStatus,
  photoStatus, setPhotoStatus,
  subjectPreview, setSubjectPreview,
}) {
  const dataFileRef  = useRef(null)
  const photoFileRef = useRef(null)

  // Parse subjects from textarea
  const getSubjects = () =>
    subjectsRaw.trim().split('\n').map((s) => s.trim()).filter(Boolean)
      .map((name) => ({ name, key: normKey(name) }))

  // ── Drag & drop ─────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
  }
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
  }
  const handleDrop = (e) => {
    e.preventDefault()
    handleDragLeave(e)
    if (e.dataTransfer.files[0]) handleDataFile(e.dataTransfer.files[0])
  }

  // ── Data file handler ────────────────────────
  const handleDataFile = async (file) => {
    if (!file) return
    const subjects = getSubjects()
    if (!subjects.length) {
      setDataStatus({ type: 'error', message: '⚠ Please define at least one subject in Step 2 first.' })
      return
    }

    setDataStatus({ type: 'info', message: `📄 Reading <strong>${file.name}</strong>…` })
    try {
      const buffer = await readFileAsBuffer(file)
      const { students, error } = await parseStudentFile(buffer, file.name, subjects)
      if (error) {
        setDataStatus({ type: 'error', message: `⚠ ${error}` })
        return
      }
      setStudents(students)
      setDataStatus({
        type: 'success',
        message: `✓ ${students.length} student${students.length !== 1 ? 's' : ''} loaded from <strong>${file.name}</strong>`,
      })
    } catch (err) {
      setDataStatus({ type: 'error', message: `⚠ ${err.message}` })
    }
  }

  // ── Photo file handler ───────────────────────
  const handlePhotoFiles = async (files) => {
    const imgs = [...files].filter((f) => f.type.startsWith('image/'))
    if (!imgs.length) {
      setPhotoStatus({ type: 'error', message: '⚠ No image files found.' })
      return
    }
    setPhotoStatus({ type: 'info', message: `Loading ${imgs.length} image${imgs.length !== 1 ? 's' : ''}…` })

    const map = {}
    await Promise.all(
      imgs.map(async (file) => {
        const roll = file.name.replace(/\.[^.]+$/, '').trim()
        map[roll]  = await readFileAsDataURL(file)
      }),
    )
    setImageMap(map)
    setPhotoStatus({
      type: 'success',
      message: `✓ ${imgs.length} photo${imgs.length !== 1 ? 's' : ''} loaded — matched by roll number`,
    })
  }

  const handlePreviewColumns = () => {
    const subjects = getSubjects()
    if (!subjects.length) {
      setSubjectPreview({ type: 'error', message: '⚠ No subjects defined.' })
      return
    }
    const cols = subjects.flatMap((s) => [`${s.key}_written`, `${s.key}_oral`])
    setSubjectPreview({ type: 'info', message: `📋 Mark columns: <strong>${cols.join(' &nbsp;·&nbsp; ')}</strong>` })
  }

  return (
    <div className="no-print py-8">
      <div className="max-w-3xl mx-auto px-4 space-y-4">

        {/* ── Header ──────────────────────────── */}
        <div className="flex items-center gap-4 mb-2">
          <img src="/assets/ama300.webp" alt="AMA Logo" className="w-14 h-14 object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')} />
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 leading-tight">Marksheet Generator</h1>
            <p className="text-sm text-slate-500">Anshu Memorial Academy — Report Card / Annual Examination</p>
            <p className="text-xs text-green-600 mt-0.5">💾 Settings auto-saved in browser</p>
          </div>
        </div>

        {/* ── STEP 1: Exam Details ─────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <StepTitle number="1">Exam Details</StepTitle>
          <div className="flex gap-4 flex-wrap">
            <Field label="Examination Type">
              <input type="text" value={examType} onChange={(e) => setExamType(e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Session">
              <input type="text" value={session} onChange={(e) => setSession(e.target.value)}
                className={inputCls} />
            </Field>
            <Field label="Date (Signature Line)">
              <input type="text" value={signDate} onChange={(e) => setSignDate(e.target.value)}
                placeholder="DD-MM-YYYY" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* ── STEP 2: Subjects ─────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <StepTitle number="2">Subjects</StepTitle>
          <Field label="One subject per line">
            <textarea value={subjectsRaw} onChange={(e) => setSubjectsRaw(e.target.value)}
              rows={7} className={`${inputCls} resize-y leading-relaxed`} />
          </Field>
          <Hint color="green">
            📚 Subject names define CSV mark column keys. e.g. "S.Science" →{' '}
            <code className="bg-green-100 px-1 rounded">sscience_written</code>,{' '}
            <code className="bg-green-100 px-1 rounded">sscience_oral</code>
            {' '}—{' '}
            <a className="font-bold underline cursor-pointer" onClick={handlePreviewColumns}>
              👁 Preview column names
            </a>
          </Hint>
          <StatusBadge status={subjectPreview} />
        </div>

        {/* ── STEP 3: Student Data ─────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <StepTitle number="3">Upload Student Data</StepTitle>

          <div
            className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer relative transition-colors hover:border-blue-500 hover:bg-blue-50 bg-slate-50"
            onClick={() => dataFileRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && dataFileRef.current?.click()}
          >
            <div className="text-3xl mb-1">📄</div>
            <p className="text-sm text-slate-500">
              Drop your <strong className="text-blue-600">Excel (.xlsx) or CSV</strong> file here, or{' '}
              <strong className="text-blue-600">click to browse</strong>
            </p>
            <p className="text-xs text-slate-400 mt-1">First sheet is used • One row per student</p>
            <input
              ref={dataFileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="absolute opacity-0 w-0 h-0"
              onChange={(e) => handleDataFile(e.target.files[0])}
            />
          </div>

          <Hint color="green">
            📋 Required:{' '}
            {['name', 'mother', 'father', 'class', 'roll'].map((c) => (
              <code key={c} className="bg-green-100 px-1 rounded mr-1">{c}</code>
            ))}
            &nbsp;Optional:{' '}
            {['section', 'dob', 'address', 'attendance', 'position', 'remarks'].map((c) => (
              <code key={c} className="bg-green-100 px-1 rounded mr-1">{c}</code>
            ))}
            {' '}—{' '}
            <a className="font-bold underline cursor-pointer"
              onClick={() => downloadSampleCSV(getSubjects())}>
              ⬇ Download sample CSV
            </a>
          </Hint>
          <StatusBadge status={dataStatus} />
        </div>

        {/* ── STEP 4: Photos ───────────────────── */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
          <StepTitle number="4" optional>Student Photos</StepTitle>
          <Field label="Select photo files (named by roll number)">
            <input
              ref={photoFileRef}
              type="file"
              accept="image/*"
              multiple
              className={`${inputCls} cursor-pointer`}
              onChange={(e) => handlePhotoFiles(e.target.files)}
            />
          </Field>
          <Hint color="yellow">
            📸 Name each file by roll number:{' '}
            <code className="bg-yellow-100 px-1 rounded">101.jpg</code>,{' '}
            <code className="bg-yellow-100 px-1 rounded">102.png</code>.
            If no photo found, card shows a <em>"Paste Photo Here"</em> placeholder.
          </Hint>
          <StatusBadge status={photoStatus} />
        </div>

        {/* ── Action Bar ──────────────────────── */}
        <div className="flex gap-3 flex-wrap items-center pt-2">
          <button
            onClick={onGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-700 text-white font-bold text-sm disabled:opacity-40 hover:bg-blue-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            ⚡ Generate Marksheets
          </button>
          <button
            onClick={onPrint}
            disabled={!canPrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-green-700 text-white font-bold text-sm disabled:opacity-40 hover:bg-green-800 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            🖨 Print All
          </button>
          <button
            onClick={onClear}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white border-2 border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            🗑 Clear
          </button>
          {cardsCount > 0 && (
            <span className="text-sm font-semibold text-slate-500 ml-auto">
              {cardsCount} marksheet{cardsCount !== 1 ? 's' : ''} generated
            </span>
          )}
        </div>

      </div>
    </div>
  )
}

/* ── Local sub-components ─────────────────────── */

const inputCls =
  'border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-600 bg-slate-50 w-full'

function StepTitle({ number, optional, children }) {
  const optBadge = optional
    ? <span className="text-slate-400 text-sm font-normal ml-1">— Optional</span>
    : null
  const badgeBg = optional ? 'bg-slate-400' : 'bg-blue-700'
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${badgeBg} text-white text-xs font-bold shrink-0`}>
        {number}
      </span>
      <span className="font-bold text-slate-900">{children}</span>
      {optBadge}
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-44">
      <label className="text-xs font-semibold text-slate-500">{label}</label>
      {children}
    </div>
  )
}

function Hint({ color, children }) {
  const styles = {
    green:  'bg-green-50  border-green-200  text-green-800',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  }
  return (
    <div className={`mt-3 border rounded-lg px-3 py-2 text-xs leading-relaxed ${styles[color]}`}>
      {children}
    </div>
  )
}
