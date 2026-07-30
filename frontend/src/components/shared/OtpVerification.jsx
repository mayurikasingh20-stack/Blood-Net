import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Send, Loader, CheckCircle, Smartphone, AlertCircle } from "lucide-react";
import { sendTwilioOtp, verifyTwilioOtp } from "../../services/authService";

const COOLDOWN_SECONDS = 30;

export default function OtpVerification({ phone, onVerified, onError }) {
  const [step, setStep] = useState("idle");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  function focusNext(idx) {
    if (idx < 5) inputsRef.current[idx + 1]?.focus();
  }

  function focusPrev(idx) {
    if (idx > 0) inputsRef.current[idx - 1]?.focus();
  }

  function handleCodeChange(idx, val) {
    if (val.length > 1) return;
    const digit = val.replace(/\D/g, "");
    if (!digit && val !== "") return;
    setCode((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
    if (digit) focusNext(idx);
  }

  function handleKeyDown(idx, e) {
    if (e.key === "Backspace" && !code[idx] && idx > 0) focusPrev(idx);
    if (e.key === "ArrowLeft") focusPrev(idx);
    if (e.key === "ArrowRight") focusNext(idx);
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setCode(pasted.split("").concat(Array(6)).slice(0, 6));
    const nextIdx = Math.min(pasted.length, 5);
    inputsRef.current[nextIdx]?.focus();
  }

  async function handleSend() {
    setError("");
    setStep("sending");
    try {
      await sendTwilioOtp(phone);
      setStep("sent");
      setCooldown(COOLDOWN_SECONDS);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send OTP.";
      setError(msg);
      setStep("idle");
      onError?.(msg);
    }
  }

  async function handleVerify() {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setError("");
    setStep("verifying");
    try {
      await verifyTwilioOtp(phone, fullCode);
      setStep("verified");
      onVerified?.();
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid code. Try again.";
      setError(msg);
      setStep("sent");
      onError?.(msg);
    }
  }

  const displayPhone = phone.length > 8
    ? phone.slice(0, 4) + "****" + phone.slice(-2)
    : phone;

  if (step === "verified") {
    return (
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <CheckCircle size={28} className="text-emerald-600" />
        </div>
        <p className="text-sm font-bold text-slate-900">Phone Verified</p>
        <p className="text-xs text-slate-500 mt-1">{displayPhone}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <div className="w-12 h-12 bg-red/10 rounded-full flex items-center justify-center mx-auto mb-3">
          <Smartphone size={24} className="text-red" />
        </div>
        <p className="text-sm font-bold text-slate-900">Verify Your Phone</p>
        <p className="text-xs text-slate-500 mt-1">
          We'll send a verification code to <strong className="text-slate-700">{displayPhone}</strong>
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red bg-red/10 px-4 py-2.5 rounded-xl border border-red/20">
          <AlertCircle size={15} className="shrink-0" /> {error}
        </div>
      )}

      {step === "idle" && (
        <button type="button" onClick={handleSend}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition"
        >
          <Send size={15} /> Send Verification Code
        </button>
      )}

      {step === "sending" && (
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500 py-2.5">
          <Loader size={16} className="animate-spin" /> Sending code...
        </div>
      )}

      {(step === "sent" || step === "verifying") && (
        <>
          <div className="flex items-center justify-center gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="w-10 h-12 text-center text-lg font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red/20 focus:border-red transition"
              />
            ))}
          </div>

          <button type="button" onClick={handleVerify} disabled={step === "verifying" || code.join("").length !== 6}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-60"
          >
            {step === "verifying" ? (
              <><Loader size={15} className="animate-spin" /> Verifying...</>
            ) : (
              <><ShieldCheck size={15} /> Verify Code</>
            )}
          </button>

          <div className="text-center">
            {cooldown > 0 ? (
              <p className="text-xs text-slate-400">Resend code in {cooldown}s</p>
            ) : (
              <button type="button" onClick={handleSend}
                className="text-xs font-semibold text-red hover:underline"
              >
                Resend Code
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
