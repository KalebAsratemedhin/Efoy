import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaPills, FaPlus, FaTrash, FaSave, FaSignature, FaArrowLeft } from "react-icons/fa";
import { useCreatePrescriptionMutation } from "../../redux/api/prescriptionAPI";
import { PrescriptionCreate } from "../../types/Prescription";
import FormError from "../utils/FormError";
import FormSuccess from "../utils/FormSuccess";
import SignatureCanvas from "react-signature-canvas";

interface FormData {
  diagnosis: string;
  notes: string;
  expiryDate: string;
}

interface PrescriptionFormProps {
  bookingId: string;
  patientName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  bookingId,
  patientName,
  onSuccess,
  onCancel
}) => {
  const [medications, setMedications] = useState<string[]>(['']);
  const [hasSignature, setHasSignature] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);
  const signatureContainerRef = useRef<HTMLDivElement>(null);
  const [signatureWidth, setSignatureWidth] = useState(520);
  const [signatureError, setSignatureError] = useState<string | null>(null);
  const [createPrescription, { isLoading, isError, error, isSuccess }] = useCreatePrescriptionMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    defaultValues: {
      diagnosis: '',
      notes: '',
      expiryDate: ''
    }
  });

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

  const addMedication = () => {
    setMedications([...medications, '']);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      const newMedications = medications.filter((_, i) => i !== index);
      setMedications(newMedications);
    }
  };

  const updateMedication = (index: number, value: string) => {
    const newMedications = [...medications];
    newMedications[index] = value;
    setMedications(newMedications);
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

  const onSubmit = async (data: FormData) => {
    if (!hasSignature) {
      setSignatureError("Please add your signature before creating the prescription.");
      return;
    }

    try {
      // Get signature data as base64
      let signatureData = '';
      if (signatureRef.current) {
        signatureData = signatureRef.current.toDataURL();
      }

      const prescriptionData: PrescriptionCreate = {
        bookingId,
        medications: medications.filter(med => med.trim() !== ''),
        diagnosis: data.diagnosis || undefined,
        notes: data.notes || undefined,
        expiryDate: data.expiryDate && data.expiryDate.trim() !== '' ? data.expiryDate : undefined,
        digitalSignature: signatureData
      };

      await createPrescription(prescriptionData).unwrap();
      reset();
      setMedications(['']);
      if (signatureRef.current) {
        signatureRef.current.clear();
      }
      setHasSignature(false);
      setSignatureError(null);
      onSuccess?.();
    } catch (err) {
      console.error('Failed to create prescription:', err);
    }
  };

  if (isSuccess) {
    return (
      <FormSuccess message="Prescription created successfully!" />
    );
  }

  const inputClass =
    "w-full px-3 py-2.5 border border-slate-200 rounded-lg text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
            <FaPills className="text-accent w-4 h-4" />
            Create prescription
          </h2>
          <p className="text-sm text-slate-600 mt-0.5">
            For <span className="font-medium text-ink">{patientName}</span>
          </p>
        </div>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-ink hover:bg-slate-50"
          >
            <FaArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            Back
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Medications */}
        <div className="space-y-3">
          <div>
            <label className={labelClass}>Medications</label>
            <p className="text-xs text-slate-500">Add one medication per line. Include dose and instructions.</p>
          </div>

          <div className="space-y-2">
            {medications.map((medication, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={medication}
                  onChange={(e) => updateMedication(index, e.target.value)}
                  placeholder={`Medication ${index + 1} (e.g. Amoxicillin 500mg — 1 cap, 3×/day)`} 
                  className={inputClass}
                  required
                />
                {medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-ink"
                    aria-label="Remove medication"
                    title="Remove"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addMedication}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-ink hover:bg-slate-50"
          >
            <FaPlus className="w-3.5 h-3.5 text-slate-500" />
            Add medication
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Diagnosis</label>
            <textarea
              {...register("diagnosis")}
              rows={4}
              placeholder="Optional diagnosis details…"
              className={`${inputClass} resize-none`}
            />
            {errors.diagnosis && <p className="text-red-500 text-xs mt-1">{String(errors.diagnosis.message)}</p>}
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              {...register("notes")}
              rows={4}
              placeholder="Optional notes for the patient…"
              className={`${inputClass} resize-none`}
            />
            {errors.notes && <p className="text-red-500 text-xs mt-1">{String(errors.notes.message)}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Expiry date</label>
            <input
              type="date"
              {...register("expiryDate")}
              min={new Date().toISOString().split("T")[0]}
              className={inputClass}
            />
            <p className="text-xs text-slate-500 mt-1.5">Optional. Leave blank if not needed.</p>
          </div>

          <div>
            <label className={`${labelClass} flex items-center gap-2`}>
              <FaSignature className="w-4 h-4 text-slate-500" />
              Signature
            </label>
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
            <div className="mt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={clearSignature}
                className="text-sm font-medium text-slate-600 hover:text-ink"
              >
                Clear
              </button>
              <span className={`text-xs font-medium ${hasSignature ? "text-green-700" : "text-amber-700"}`}>
                {hasSignature ? "Signed" : "Signature required"}
              </span>
            </div>
            {signatureError && <p className="text-red-500 text-xs mt-1.5">{signatureError}</p>}
          </div>
        </div>

        {isError && <FormError error={error} />}

        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <button
            type="submit"
            disabled={isLoading || !hasSignature}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaSave className="w-4 h-4" />
            {isLoading ? "Creating…" : "Create prescription"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default PrescriptionForm; 