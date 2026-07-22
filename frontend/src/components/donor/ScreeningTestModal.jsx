import { useState } from "react";
import { X } from "lucide-react";

// disqualifyIfYes: true means answering "Yes" fails the check; false means answering "No" fails it
const questions = [
  { id: "fever", text: "Do you currently have a fever, cold, or any infection?", disqualifyIfYes: true },
  { id: "weight", text: "Do you weigh at least 50 kg?", disqualifyIfYes: false },
  { id: "medication", text: "Are you currently taking antibiotics or other medication?", disqualifyIfYes: true },
  { id: "surgery", text: "Have you had major surgery in the last 3 months?", disqualifyIfYes: true },
  { id: "tattoo", text: "Have you had a tattoo or piercing in the last 6 months?", disqualifyIfYes: true },
  { id: "sleep", text: "Did you sleep at least 6 hours last night?", disqualifyIfYes: false },
];

function ScreeningTestModal({ onClose, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  const handleAnswer = (id, value) => setAnswers((p) => ({ ...p, [id]: value }));

  const computeResult = () => {
    for (const q of questions) {
      const answer = answers[q.id];
      if (q.disqualifyIfYes && answer === true) return false;
      if (!q.disqualifyIfYes && answer === false) return false;
    }
    return true;
  };

  const handleSubmit = () => {
    if (!allAnswered) return;
    setSubmitted(true);
  };

  const passed = submitted ? computeResult() : null;

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-4">
      <div className="bg-paper rounded-[22px] p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl font-semibold">Donor Screening Test</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        {!submitted && (
          <>
            <p className="text-sm text-ink-soft mb-5">
              Answer honestly — this determines whether you're currently safe to donate blood.
            </p>
            <div className="space-y-4">
              {questions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm font-medium mb-2">{q.text}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAnswer(q.id, true)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                        answers[q.id] === true ? "bg-red-deep text-white border-red-deep" : "border-ink/15 hover:border-red/40"
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleAnswer(q.id, false)}
                      className={`px-4 py-2 rounded-lg border text-sm font-semibold ${
                        answers[q.id] === false ? "bg-red-deep text-white border-red-deep" : "border-ink/15 hover:border-red/40"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="w-full mt-6 bg-red-deep text-white font-semibold py-3 rounded-full hover:bg-red transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Submit Screening
            </button>
          </>
        )}

        {submitted && (
          <div className="text-center py-6">
            {passed ? (
              <>
                <p className="text-2xl font-serif font-semibold text-green mb-2">You're eligible to donate ✓</p>
                <p className="text-sm text-ink-soft mb-6">Based on your answers, you can safely proceed to help with blood requests.</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-serif font-semibold text-red-deep mb-2">Not eligible right now</p>
                <p className="text-sm text-ink-soft mb-6">Based on your answers, it's best to wait before donating. Please consult a doctor if unsure.</p>
              </>
            )}
            <button
              onClick={() => onComplete(passed)}
              className="w-full bg-red-deep text-white font-semibold py-3 rounded-full hover:bg-red transition"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScreeningTestModal;