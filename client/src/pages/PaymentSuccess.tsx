import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaDownload, FaEnvelope, FaArrowLeft } from "react-icons/fa";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const paymentAmount = 150.0;
  const formatCurrency = (amount: number, currency: string = "USD") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);

  const handleDownloadReceipt = () => {
    const receipt = `EFOY - PAYMENT RECEIPT

Transaction ID: ${sessionId || "N/A"}
Amount: ${formatCurrency(paymentAmount)}
Status: Completed
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Thank you for your payment. Your appointment has been confirmed.`;
    const blob = new Blob([receipt], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${sessionId || "payment"}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleEmailReceipt = () => {
    const subject = "Payment Confirmation - Efoy";
    const body = `Your payment has been successfully processed.

Transaction ID: ${sessionId || "N/A"}
Amount: ${formatCurrency(paymentAmount)}
Status: Completed

Your appointment has been confirmed.`;
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <div className="max-w-xl mx-auto text-left py-8 px-4">
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
        <div className="p-8 sm:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
              <FaCheckCircle className="text-accent w-8 h-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-ink text-center">Payment successful</h1>
          <p className="text-slate-600 text-sm text-center mt-2">
            Your appointment is confirmed. You may receive a confirmation email shortly.
          </p>

          <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Amount paid</span>
              <span className="font-semibold text-ink">{formatCurrency(paymentAmount)}</span>
            </div>
            {sessionId && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Transaction ID</span>
                <span className="text-ink font-mono text-xs truncate max-w-[180px]" title={sessionId}>
                  {sessionId}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Date</span>
              <span className="text-ink">{new Date().toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-ink bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <FaDownload className="w-4 h-4 text-slate-500" />
              Download receipt
            </button>
            <button
              type="button"
              onClick={handleEmailReceipt}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-ink bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <FaEnvelope className="w-4 h-4 text-slate-500" />
              Email receipt
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={() => navigate("/appointments")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50"
            >
              <FaArrowLeft className="w-3.5 h-3.5" />
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
