import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

/**
 * QRBox — renders a QR code image for a student.
 * Uses the `qrcode` npm package (QRCode.toDataURL API).
 *
 * @param {{ student: object, session: string, totalObtained: number, totalFull: number, pct: string, overallGrade: string }} props
 */
export default function QRBox({ student, session, totalObtained, totalFull, pct, overallGrade }) {
  const imgRef = useRef(null)

  useEffect(() => {
    const text = [
      `School: Anshu Memorial Academy`,
      `Name: ${student.name}`,
      `Roll: ${student.roll}`,
      `Class: ${student.class}`,
      `Session: ${session}`,
      `Marks: ${totalObtained}/${totalFull}`,
      `Pct: ${pct}%`,
      `Grade: ${overallGrade}`,
    ].join('\n')

    QRCode.toDataURL(text, { width: 200, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((url) => {
        if (imgRef.current) imgRef.current.src = url
      })
      .catch((err) => console.error('QR generation failed:', err))
  }, [student, session, totalObtained, totalFull, pct, overallGrade])

  return (
    <div className="w-full aspect-square border border-black bg-white overflow-hidden flex items-center justify-center">
      <img ref={imgRef} className="w-full h-full" alt={`QR Code for ${student.name}`} />
    </div>
  )
}
