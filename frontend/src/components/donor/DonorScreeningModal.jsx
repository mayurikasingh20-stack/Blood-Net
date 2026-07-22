import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Loader } from "lucide-react";
import api from "../../services/api";

const DONATION_MIN_GAP_DAYS = 56;

export default function DonorScreeningModal({ requestId, requestBloodGroup, onComplete, onClose }) {
  const [step, setStep] = useState("checking");
  const [intervalData, setIntervalData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    checkEligibility();
  }, []);

  async function checkEligibility() {
    setStep("checking");
    try {
      const res = await api.post("/donor/check-eligibility");
      if (res.data.eligible) {
        setStep("questions");
        loadQuestions();
      } else {
        setIntervalData(res.data);
        setStep("interval_blocked");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not check eligibility.");
      setStep("error");
    }
  }

  async function loadQuestions() {
    try {
      const res = await api.get("/donor/screening-questions");
      setQuestions(res.data.questions || []);
    } catch {
      setError("Could not load screening questions.");
      setStep("error");
    }
  }

  function setAnswer(qId, value) {
    setAnswers((prev) => ({ ...prev, [qId]: value }));
  }

  function nextQuestion() {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
    }
  }

  function prevQuestion() {
    if (currentQ > 0) {
      setCurrentQ((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    const allAnswered = questions.every((q) => answers[q.id] !== undefined);
    if (!allAnswered) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        answers: questions.map((q) => ({
          id: q.id,
          answer: answers[q.id],
        })),
      };
      const res = await api.post("/donor/submit-screening", payload);
      setResult(res.data);
      if (res.data.eligible) {
        setStep("passed");
      } else {
        setStep("failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit screening.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmAccept() {
    setSubmitting(true);
    try {
      const res = await api.post(`/donations/accept/${requestId}`);
      onComplete(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not accept request.");
    } finally {
      setSubmitting(false);
    }
  }

  function isCurrentAnswered() {
    const q = questions[currentQ];
    if (!q) return false;
    return answers[q.id] !== undefined;
  }

  function renderIntervalBlocked() {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Not Eligible to Donate</h3>
        <p className="text-sm text-slate-600 mb-4">{intervalData?.reason}</p>
        {intervalData?.next_eligible_date && (
          <div className="bg-amber-50 rounded-xl p-3 mb-4">
            <p className="text-xs text-amber-700 font-semibold">Next Eligible Date</p>
            <p className="text-sm font-bold text-amber-800">
              {new Date(intervalData.next_eligible_date).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition"
        >
          Close
        </button>
      </div>
    );
  }

  function renderQuestions() {
    const q = questions[currentQ];
    if (!q) return null;
    const progress = ((currentQ + 1) / questions.length) * 100;

    return (
      <div>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-slate-500">
            Question {currentQ + 1} of {questions.length}
          </span>
          <span className="text-xs text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-100 rounded-full mb-6">
          <div className="h-1.5 bg-red rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="min-h-[180px]"
          >
            <p className="text-sm font-bold text-slate-900 mb-6">{q.question}</p>
            <div className="flex gap-4">
              <button
                onClick={() => setAnswer(q.id, "yes")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  answers[q.id] === "yes"
                    ? "border-red bg-red/5 text-red"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => setAnswer(q.id, "no")}
                className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  answers[q.id] === "no"
                    ? "border-red bg-red/5 text-red"
                    : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                No
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex gap-3 mt-8">
          {currentQ > 0 ? (
            <button
              onClick={prevQuestion}
              className="flex items-center gap-1 px-4 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              <ChevronLeft size={16} /> Previous
            </button>
          ) : (
            <div />
          )}
          {currentQ < questions.length - 1 ? (
            <button
              onClick={nextQuestion}
              disabled={!isCurrentAnswered()}
              className="flex items-center gap-1 px-5 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-50 ml-auto"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!isCurrentAnswered() || submitting}
              className="px-5 py-2.5 bg-red text-white rounded-full text-sm font-bold hover:bg-red-700 transition disabled:opacity-50 ml-auto"
            >
              {submitting ? "Submitting..." : "Submit Screening"}
            </button>
          )}
        </div>
      </div>
    );
  }

  function renderPassed() {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={28} className="text-emerald-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">You Are Eligible!</h3>
        <p className="text-sm text-slate-600 mb-6">You are eligible to donate blood. Click below to confirm your acceptance.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmAccept}
            disabled={submitting}
            className="flex-[2] py-2.5 bg-emerald-600 text-white rounded-full text-sm font-bold hover:bg-emerald-700 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {submitting ? <Loader size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            {submitting ? "Confirming..." : "Confirm Acceptance"}
          </button>
        </div>
      </div>
    );
  }

  function renderFailed() {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Not Eligible to Donate</h3>
        <p className="text-sm text-slate-600 mb-4">You are currently not eligible to donate blood.</p>
        {result?.failed_reasons?.length > 0 && (
          <div className="bg-red-50 rounded-xl p-4 mb-4 text-left">
            <p className="text-xs font-bold text-red mb-2">Reasons:</p>
            <ul className="space-y-1">
              {result.failed_reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-red-700">
                  <span className="mt-0.5">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition"
        >
          Close
        </button>
      </div>
    );
  }

  function renderError() {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 rounded-full bg-red/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={28} className="text-red" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">Error</h3>
        <p className="text-sm text-slate-600 mb-4">{error || "Something went wrong."}</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 bg-slate-200 text-slate-700 rounded-full text-sm font-bold hover:bg-slate-300 transition"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {step === "checking" && "Checking Eligibility"}
              {step === "interval_blocked" && "Eligibility Check"}
              {step === "questions" && "Donor Eligibility Screening"}
              {step === "passed" && "Screening Passed"}
              {step === "failed" && "Screening Failed"}
              {step === "error" && "Error"}
            </h3>
            {step === "questions" && (
              <p className="text-xs text-slate-500 mt-1">
                Please answer honestly. This screening helps ensure the safety of both the donor and the patient.
              </p>
            )}
            {step === "checking" && (
              <p className="text-xs text-slate-500 mt-1">Checking your donation interval...</p>
            )}
          </div>
          {step !== "submitting" && (
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition flex-shrink-0">
              <X size={20} className="text-slate-400" />
            </button>
          )}
        </div>

        {error && step !== "error" && (
          <div className="flex items-center gap-2 text-sm text-red bg-red/10 px-4 py-3 rounded-xl mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {step === "checking" && (
          <div className="flex items-center justify-center py-8">
            <Loader size={28} className="animate-spin text-red" />
          </div>
        )}
        {step === "interval_blocked" && renderIntervalBlocked()}
        {step === "questions" && renderQuestions()}
        {step === "passed" && renderPassed()}
        {step === "failed" && renderFailed()}
        {step === "error" && renderError()}
      </motion.div>
    </div>
  );
}
