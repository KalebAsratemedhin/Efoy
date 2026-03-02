import React, { useEffect, useRef, useState } from "react";
import { FaCalendar, FaDownload, FaPills, FaPrint, FaTimes, FaUser, FaUserMd } from "react-icons/fa";
import SignatureCanvas from "react-signature-canvas";
import jsPDF from "jspdf";
import { Prescription } from "../../types/Prescription";

interface PrescriptionDisplayProps {
  prescription: Prescription;
  onClose?: () => void;
}

const PrescriptionDisplay: React.FC<PrescriptionDisplayProps> = ({
  prescription,
  onClose
}) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const [signatureWidth, setSignatureWidth] = useState(520);

  useEffect(() => {
    const el = signatureContainerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.clientWidth;
      const next = Math.max(280, Math.min(720, w));
      setSignatureWidth(next);
    };

    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const generatePDF = () => {
    if (!hasSignature && !prescription.digitalSignature) {
      setSignatureError("Please add a signature to download the PDF.");
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;

    let yPosition = margin + 20;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text("MEDICAL PRESCRIPTION", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 20;

    // Prescription ID
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Prescription ID: ${prescription.id}`, margin, yPosition);
    yPosition += 15;

    // Date
    pdf.setTextColor(0, 0, 0);
    pdf.text(`Date: ${formatDate(prescription.issueDate)}`, margin, yPosition);
    yPosition += 20;

    // Doctor Information
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("PRESCRIBING DOCTOR:", margin, yPosition);
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.text(`Dr. ${prescription.doctorId?.fullName || 'N/A'}`, margin + 10, yPosition);
    yPosition += 8;
    pdf.text(`Email: ${prescription.doctorId?.email || 'N/A'}`, margin + 10, yPosition);
    yPosition += 20;

    // Patient Information
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("PATIENT INFORMATION:", margin, yPosition);
    yPosition += 8;
    pdf.setFontSize(12);
    pdf.text(`Name: ${prescription.patientId?.fullName || 'N/A'}`, margin + 10, yPosition);
    yPosition += 8;
    pdf.text(`Email: ${prescription.patientId?.email || 'N/A'}`, margin + 10, yPosition);
    yPosition += 20;

    // Diagnosis
    if (prescription.diagnosis) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("DIAGNOSIS:", margin, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text(prescription.diagnosis, margin + 10, yPosition);
      yPosition += 20;
    }

    // Medications
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text("PRESCRIBED MEDICATIONS:", margin, yPosition);
    yPosition += 8;
    pdf.setFontSize(12);
    
    prescription.medications?.forEach((medication, index) => {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin + 20;
      }
      pdf.text(`${index + 1}. ${medication}`, margin + 10, yPosition);
      yPosition += 8;
    });

    // Notes
    if (prescription.notes) {
      yPosition += 10;
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin + 20;
      }
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text("ADDITIONAL NOTES:", margin, yPosition);
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.text(prescription.notes, margin + 10, yPosition);
      yPosition += 20;
    }

    // Expiry Date
    if (prescription.expiryDate) {
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = margin + 20;
      }
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Expiry Date: ${formatDate(prescription.expiryDate)}`, margin, yPosition);
      yPosition += 20;
    }

    // Signature Section
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = margin + 20;
    }

    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text("DOCTOR SIGNATURE:", margin, yPosition);
    yPosition += 8;

    // Add signature image - use stored signature if available, otherwise use current signature
    let signatureDataURL = '';
    if (prescription.digitalSignature) {
      signatureDataURL = prescription.digitalSignature;
    } else if (signatureRef.current && hasSignature) {
      signatureDataURL = signatureRef.current.toDataURL();
    }

    if (signatureDataURL) {
      try {
        pdf.addImage(signatureDataURL, "PNG", margin, yPosition, 60, 30);
        yPosition += 35;
      } catch (error) {
        console.error("Error adding signature to PDF:", error);
      }
    }

    pdf.text(`Signed on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Prescription ID: ${prescription.id}`, margin, yPosition);

    // Footer
    yPosition += 20;
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = margin + 20;
    }
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      "This is a digital prescription generated by Efoy",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );

    // Save PDF
    const fileName = `prescription_${prescription.id}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setHasSignature(false);
      setSignatureError(null);
    }
  };

  const handleSignatureEnd = () => {
    setHasSignature(true);
    setSignatureError(null);
  };

  const canGeneratePDF = hasSignature || prescription.digitalSignature;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm text-left">
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
            <FaPills className="w-5 h-5 text-accent" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-ink">Prescription</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              ID <span className="font-mono text-xs">{prescription.id?.slice(-12) || "—"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {prescription.status && (
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize ${
                prescription.status === "active"
                  ? "bg-green-100 text-green-800"
                  : prescription.status === "expired"
                    ? "bg-red-100 text-red-800"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {prescription.status}
            </span>
          )}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-accent/30"
              aria-label="Close"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
              <FaUserMd className="w-4 h-4 text-slate-500" />
              Prescribing doctor
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Name</p>
                <p className="text-ink font-medium">Dr. {prescription.doctorId?.fullName || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Email</p>
                <p className="text-ink">{prescription.doctorId?.email || "—"}</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-3">
              <FaUser className="w-4 h-4 text-slate-500" />
              Patient
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500 text-xs">Name</p>
                <p className="text-ink font-medium">{prescription.patientId?.fullName || "—"}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs">Email</p>
                <p className="text-ink">{prescription.patientId?.email || "—"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
              <FaCalendar className="w-4 h-4 text-slate-500" />
              Issue date
            </div>
            <p className="text-ink text-sm">{formatDate(prescription.issueDate)}</p>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink mb-2">
              <FaCalendar className="w-4 h-4 text-slate-500" />
              Expiry date
            </div>
            <p className="text-ink text-sm">{formatDate(prescription.expiryDate)}</p>
          </div>
        </div>

        {prescription.diagnosis && (
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <p className="text-sm font-semibold text-ink mb-2">Diagnosis</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{prescription.diagnosis}</p>
          </div>
        )}

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm font-semibold text-ink">Medications</p>
            <span className="text-xs text-slate-500">{prescription.medications?.length || 0} item(s)</span>
          </div>
          <div className="space-y-2">
            {prescription.medications?.map((medication, index) => (
              <div key={index} className="flex gap-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <div className="w-7 h-7 rounded-full bg-accent/10 text-accent text-xs font-semibold flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-ink">{medication}</p>
              </div>
            ))}
            {!prescription.medications?.length && (
              <p className="text-sm text-slate-500">No medications listed.</p>
            )}
          </div>
        </div>

        {prescription.notes && (
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <p className="text-sm font-semibold text-ink mb-2">Notes</p>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{prescription.notes}</p>
          </div>
        )}

        <div className="p-4 rounded-xl border border-slate-200 bg-white">
          <p className="text-sm font-semibold text-ink mb-3">Signature</p>
          {prescription.digitalSignature ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
              <img
                src={prescription.digitalSignature}
                alt="Doctor signature"
                className="w-full h-40 object-contain bg-white border border-slate-200 rounded-lg"
              />
              <p className="text-xs text-slate-600 mt-2">
                Signed by <span className="font-medium text-ink">Dr. {prescription.doctorId?.fullName || "—"}</span>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div ref={signatureContainerRef} className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "w-full rounded-lg bg-white border border-slate-200",
                    width: signatureWidth,
                    height: 160,
                  }}
                  penColor="#0f172a"
                  backgroundColor="#ffffff"
                  onEnd={handleSignatureEnd}
                  minWidth={0.5}
                  maxWidth={2}
                  throttle={16}
                  velocityFilterWeight={0.7}
                  dotSize={1}
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-sm font-medium text-slate-600 hover:text-ink"
                >
                  Clear
                </button>
                <span className={`text-xs font-medium ${hasSignature ? "text-green-700" : "text-amber-700"}`}>
                  {hasSignature ? "Signed" : "Signature required to download PDF"}
                </span>
              </div>
              {signatureError && <p className="text-red-500 text-xs">{signatureError}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-5 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={generatePDF}
            disabled={!canGeneratePDF}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaDownload className="w-4 h-4" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-ink hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <FaPrint className="w-4 h-4 text-slate-500" />
            Print
          </button>
        </div>
        <p className="text-xs text-slate-500">Generated by Efoy</p>
      </div>
    </div>
  );
};

export default PrescriptionDisplay; 