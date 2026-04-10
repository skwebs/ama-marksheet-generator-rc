import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const LOGO = "/assets/ama300.webp";

export default function QRBox({ student, session, totalObtained, totalFull, pct, overallGrade }) {
  const containerRef = useRef(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const qrData = [
      `School: Anshu Memorial Academy`,
      `Name: ${student.name}`,
      `Father: ${student.father}`,
      `Mother: ${student.mother}`,
      `Roll: ${student.roll}`,
      `Class: ${student.class}`,
      `Session: ${session}`,
      `Marks: ${totalObtained}/${totalFull}`,
      `Pct: ${pct}%`,
      `Grade: ${overallGrade}`,
    ].join("\n");

    const options = {
      width: 300,
      height: 300,
      margin: 0, // ✅ top-level, not inside qrOptions
      data: qrData,
      image: LOGO, // ✅ no #Date.now() hash
      qrOptions: {
        errorCorrectionLevel: "H", // ✅ better for logo-embedded QRs
      },
      dotsOptions: {
        color: "#000000",
        type: "rounded",
      },
      backgroundOptions: {
        color: "#ffffff",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 0,
        imageSize: 0.3,
      },
    };

    if (qrRef.current) {
      qrRef.current.update(options);
    } else {
      container.innerHTML = "";
      qrRef.current = new QRCodeStyling(options);
      qrRef.current.append(container);
    }

    // ✅ cleanup on dep change — prevents stale QR on hot re-renders
    return () => {
      container.innerHTML = "";
      qrRef.current = null;
    };
  }, [student, session, totalObtained, totalFull, pct, overallGrade]);

  return (
    <div className='size-50 border border-black bg-white overflow-hidden flex items-center justify-center'>
      <div ref={containerRef} style={{ transform: "scale(0.67)", transformOrigin: "center" }} />
    </div>
  );
}
