import { calcGrade } from "../utils/grading.js";
import QRBox from "./QRBox.jsx";

const GRADING_ROWS = [
  ["A+", "91%-100%"],
  ["A", "81%-90%"],
  ["B+", "71%-80%"],
  ["B", "61%-70%"],
  ["C+", "51%-60%"],
  ["C", "41%-50%"],
  ["D", "33%-40%"],
  ["E", "Less than 33%"],
];

/**
 * MarksheetPage — renders a single A4 report card for one student.
 *
 * @param {{
 *   student: object,
 *   subjects: Array<{name: string, key: string}>,
 *   examType: string,
 *   session: string,
 *   signDate: string,
 *   photoSrc: string|null,
 * }} props
 */
export default function MarksheetPage({ student, subjects, examType, session, signDate, photoSrc }) {
  // Build per-subject computed data
  const subjectData = subjects.map((s) => {
    const m = student.subjectMarks[s.key] || { full: 100, written: 0, oral: 0 };
    const total = m.written + m.oral;
    const grade = m.full ? calcGrade(total, m.full) : "-";
    return {
      name: s.name,
      full: m.full,
      written: m.written,
      oral: m.oral,
      total,
      grade,
    };
  });

  const totalObtained = subjectData.reduce((a, r) => a + r.total, 0);
  const totalFull = subjectData.reduce((a, r) => a + r.full, 0);
  const pct = totalFull ? ((totalObtained / totalFull) * 100).toFixed(1) : "0.0";
  const overallGrade = totalFull ? calcGrade(totalObtained, totalFull) : "-";

  return (
    <section className='sheet p-4 flex flex-col'>
      <div className='main-content border-2 border-black h-full flex flex-col'>
        {/* ── Top bar ─────────────────────────── */}
        <div className='flex justify-between px-2'>
          <div className='font-semibold'>Estd. : 2017</div>
          <div className='grow font-semibold text-center'>AN ISO 9001:2015 CERTIFIED SCHOOL</div>
          <div className='font-semibold'>Reg. No. 054631</div>
        </div>

        {/* ── School header ────────────────────── */}
        <div className='flex justify-between px-2 py-2'>
          <div>
            <img width='84' src='/assets/ama300.webp' alt='logo' />
          </div>
          <div className='grow flex flex-col text-center'>
            <div className='font-semibold text-4xl' style={{ fontFamily: "Roboto, Helvetica, sans-serif" }}>
              Anshu Memorial Academy
            </div>
            <div className='font-semibold'>Bhatha Chowk, Bhatha Dasi, Rajapakar, Vaishali</div>
            <div className='text-sm'>Run &amp; Managed by AnitaBindeshwar Foundation (Regd. under Company Act 2013)</div>
          </div>
          <div>
            <img width='84' src='/assets/bbbp300.webp' alt='Beti Bachao Beti Padhao' />
          </div>
        </div>

        {/* ── Card title ───────────────────────── */}
        <div className='w-full text-center border-t-2 border-black'>
          <div>REPORT CARD [{examType.toUpperCase()}]</div>
          <div>SESSION {session}</div>
        </div>

        {/* ── Student details ──────────────────── */}
        <div className='w-full border-t-2 border-black py-2 px-4'>
          <div className='flex gap-x-2'>
            <div className='grow'>
              <table className='w-full text-left'>
                <tbody>
                  <tr>
                    <th className='px-3 py-2'>Name</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2'>{student.name}</td>
                    <th className='px-3 py-2'>Class</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2'>{student.class}</td>
                  </tr>
                  <tr>
                    <th className='px-3 py-2'>Mother's Name</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2'>{student.mother}</td>
                    <th className='px-3 py-2'>Roll No.</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2'>{student.roll}</td>
                  </tr>
                  <tr>
                    <th className='px-3 py-2'>Father's Name</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2'>{student.father}</td>
                    <th className='px-3 py-2'>Section</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2'>{student.section}</td>
                  </tr>
                  <tr>
                    <th className='px-3 py-2'>Date of Birth</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2'>{student.dob}</td>
                  </tr>
                  <tr>
                    <th className='px-3 py-2'>Address</th>
                    <td className='px-3 py-2'>:</td>
                    <td className='px-3 py-2' colSpan={4}>
                      {student.address}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Student photo */}
            <div>
              <div className='border-2 border-black w-37.5 h-45 overflow-hidden bg-white flex items-center justify-center'>
                {photoSrc ? (
                  <img src={photoSrc} className='w-full h-full object-cover' alt='Student' />
                ) : (
                  <span className='text-gray-400 text-xs text-center leading-relaxed'>
                    Paste
                    <br />
                    Photo
                    <br />
                    Here
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Marks section ────────────────────── */}
        <div className='w-full border-y-2 py-2 border-black px-4'>
          <div className='flex gap-5'>
            {/* Marks table */}
            <table className='w-full text-center'>
              <thead>
                <tr className='border-b-2 border-black'>
                  <th className='px-3 py-2 text-left'>Subjects</th>
                  <th className='px-3 py-2'>Full Marks</th>
                  <th className='px-3 py-2'>Obtained Marks</th>
                  {/* <th className="px-3 py-2">Oral</th> */}
                  <th className='px-3 py-2'>Total</th>
                  <th className='px-3 py-2'>Grade</th>
                </tr>
              </thead>
              <tbody>
                {subjectData.map((sub) => (
                  <tr key={sub.name} className='border-b border-gray-300'>
                    <th className='px-3 py-2 text-left font-semibold'>{sub.name}</th>
                    <td className='px-3 py-2'>{sub.full || "—"}</td>
                    <td className='px-3 py-2'>{sub.written || "—"}</td>
                    {/* <td className="px-3 py-2">{sub.oral || "—"}</td> */}
                    <td className='px-3 py-2'>{sub.total || "—"}</td>
                    <td className='px-3 py-2'>{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Side panel: QR + Grading */}
            <div className='w-50 shrink-0'>
              <QRBox student={student} session={session} totalObtained={totalObtained} totalFull={totalFull} pct={pct} overallGrade={overallGrade} />
              <table className='border border-black mt-2 text-xs w-full text-left'>
                <tbody>
                  <tr>
                    <th className='border border-black px-1 text-center' colSpan={2}>
                      Grading System
                    </th>
                  </tr>
                  {GRADING_ROWS.map(([grade, range]) => (
                    <tr key={grade}>
                      <th className='border border-black px-1'>{grade}</th>
                      <td className='border border-black px-1'>{range}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Summary row ─────────────────────── */}
        <div className='px-4 py-2'>
          <table className='border border-black w-full text-center'>
            <tbody>
              <tr>
                <th className='border border-black px-2 py-1'>Obtained Marks</th>
                <th className='border border-black px-2 py-1'>Obtained Marks %</th>
                <th className='border border-black px-2 py-1'>Attendance</th>
                <th className='border border-black px-2 py-1'>Grade</th>
                <th className='border border-black px-2 py-1'>Position in Class</th>
              </tr>
              <tr>
                <td className='border border-black px-2 py-1'>
                  {totalObtained} / {totalFull}
                </td>
                <td className='border border-black px-2 py-1'>{pct}%</td>
                <td className='border border-black px-2 py-1'>{student.attendance || "—"}</td>
                <td className='border border-black px-2 py-1 font-bold'>{overallGrade}</td>
                <td className='border border-black px-2 py-1'>{student.position || "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* ── Remarks ─────────────────────────── */}
        <div className='px-4'>
          <span className='font-semibold'>Remarks : </span>
          <span>{student.remarks}</span>
        </div>

        {/* ── Fill space ──────────────────────── */}
        <div className='w-full grow' />

        {/* ── Signatures ──────────────────────── */}
        <div className='w-full px-5'>
          <div className='flex w-full items-end'>
            {/* Date */}
            <div className='flex-1 flex justify-center'>
              <div className='text-center'>
                <div>{signDate}</div>
                <div className='border-t-2 border-dashed border-black'>Date</div>
              </div>
            </div>

            {/* Class Teacher */}
            <div className='flex-1 flex justify-center'>
              <div className='border-t-2 border-dashed border-black px-5 text-center'>Class Teacher</div>
            </div>

            {/* Principal */}
            <div className='flex-1 flex justify-center'>
              <div className='text-center'>
                <img className=' w-40 mx-auto scale-125 -translate-1.5' src='/assets/principal_seal400.webp' alt='Principal Seal' />
                <div className='border-t-2 border-dashed border-black w-full'>Principal</div>
              </div>
            </div>
          </div>
        </div>

        {/* new signatures part */}
        {/* <div className='w-full px-5 bg-red-100'>
          <div className='flex justify-between w-full'>
            <div className='flex-1 bg-blue-50'>
              <div className='w-30 '>
                <div className='flex flex-col text-center'>
                  <div>{signDate}</div>
                  <div className='border-t-2 border-dashed border-black'>Date</div>
                </div>
              </div>
            </div>
            <div className='flex-1 justify-center w-full bg-green-50 flex text-center'>
              <div className='w-40 border-t-2 justify-baseline align-baseline border-dashed'> Class Teacher</div>
            </div>
            <div className='flex-1 bg-yellow-50 flex text-center justify-end'>
              <div className='w-50'>
                <img src='/assets/principal_seal400.webp' alt='Principal Seal' />
                <div className='border-t-2 border-dashed'>Principal</div>
              </div>
            </div>
          </div>
        </div> */}
        {/* old signatures part */}
        {/* <div className='flex'>
          <div className='w-full flex justify-between p-2 items-end'>
            <div className='font-semibold px-5'>
              <div className='flex flex-col text-center'>
                <div>{signDate}</div>
                <div className='border-t-2 border-dashed border-black'>Date</div>
              </div>
            </div>
            <div className='font-semibold border-t-2 border-dashed border-black px-5'>Class Teacher</div>
            <div className='font-semibold px-5'>
              <div className='flex flex-col text-center'>
                <div>
                  <img className='w-50' src='/assets/principal_seal400.webp' alt='Principal Seal' />
                </div>
                <div className='border-t-2 border-dashed border-black'>Principal</div>
              </div>
            </div>
          </div>
        </div> */}

        {/* ── Green footer bar ─────────────────── */}
        <div className='bg-green-700 text-white px-1 py-px flex justify-between border-t-2 border-black'>
          {/* Phone */}
          <div className='flex'>
            <svg className='size-5 text-white m-auto mr-1' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
              <path
                stroke='currentColor'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M18.427 14.768 17.2 13.542a1.733 1.733 0 0 0-2.45 0l-.613.613a1.732 1.732 0 0 1-2.45 0l-1.838-1.84a1.735 1.735 0 0 1 0-2.452l.612-.613a1.735 1.735 0 0 0 0-2.452L9.237 5.572a1.6 1.6 0 0 0-2.45 0c-3.223 3.2-1.702 6.896 1.519 10.117 3.22 3.221 6.914 4.745 10.12 1.535a1.601 1.601 0 0 0 0-2.456Z'
              />
            </svg>
            <a className='my-auto' href='tel:+919128289100'>
              9128289100
            </a>
          </div>
          {/* WhatsApp */}
          <div className='flex'>
            <svg className='size-5 text-white my-auto mr-1' xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' viewBox='0 0 24 24'>
              <path
                fill='currentColor'
                fillRule='evenodd'
                d='M12 4a8 8 0 0 0-6.895 12.06l.569.718-.697 2.359 2.32-.648.379.243A8 8 0 1 0 12 4ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10a9.96 9.96 0 0 1-5.016-1.347l-4.948 1.382 1.426-4.829-.006-.007-.033-.055A9.958 9.958 0 0 1 2 12Z'
                clipRule='evenodd'
              />
              <path
                fill='currentColor'
                d='M16.735 13.492c-.038-.018-1.497-.736-1.756-.83a1.008 1.008 0 0 0-.34-.075c-.196 0-.362.098-.49.291-.146.217-.587.732-.723.886-.018.02-.042.045-.057.045-.013 0-.239-.093-.307-.123-1.564-.68-2.751-2.313-2.914-2.589-.023-.04-.024-.057-.024-.057.005-.021.058-.074.085-.101.08-.079.166-.182.249-.283l.117-.14c.121-.14.175-.25.237-.375l.033-.066a.68.68 0 0 0-.02-.64c-.034-.069-.65-1.555-.715-1.711-.158-.377-.366-.552-.655-.552-.027 0 0 0-.112.005-.137.005-.883.104-1.213.311-.35.22-.94.924-.94 2.16 0 1.112.705 2.162 1.008 2.561l.041.06c1.161 1.695 2.608 2.951 4.074 3.537 1.412.564 2.081.63 2.461.63.16 0 .288-.013.4-.024l.072-.007c.488-.043 1.56-.599 1.804-1.276.192-.534.243-1.117.115-1.329-.088-.144-.239-.216-.43-.308Z'
              />
            </svg>
            <a href='https://wa.me/919973757920?text=Hi%20I%20need%20help' className='my-auto'>
              9973757920
            </a>
          </div>
          {/* Email */}
          <div className='flex'>
            <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth='1.5' stroke='currentColor' className='size-5 my-auto mr-1'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75'
              />
            </svg>
            <a href='mailto:anshumemorial@gmail.com' className='my-auto'>
              anshumemorial@gmail.com
            </a>
          </div>
          {/* Website */}
          <div className='flex'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 496 512' className='size-5 fill-white my-auto mr-1'>
              <path d='M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z' />
            </svg>
            <a href='https://anshumemorial.in' className='my-auto'>
              anshumemorial.in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
