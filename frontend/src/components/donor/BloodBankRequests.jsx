import { useState } from "react";
import axios from "axios";
import ConfirmDonationModal from "../shared/ConfirmDonationModal";

const urgencyRank = { Critical: 0, High: 1, Moderate: 2 };
const urgencyStyles = {
  Critical: "bg-red/10 text-red-deep",
  High: "bg-amber/15 text-[#8A5A15]",
  Moderate: "bg-green/10 text-green",
};

function BloodBankRequests({ requests, currentUser, cycleComplete, screeningPassed, onStartScreening }) {
  const [accepted, setAccepted] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [localAcceptedBy, setLocalAcceptedBy] = useState({});

  const sorted = [...requests].sort(
    (a, b) => (urgencyRank[a.urgency] ?? 3) - (urgencyRank[b.urgency] ?? 3)
  );

  const handleAccept = async (req) => {
    if (accepted[req.id]) {
      setSelectedRequest(null);
      return;
    }

    setAccepted((prev) => ({ ...prev, [req.id]: true }));
    setLocalAcceptedBy((prev) => ({
      ...prev,
      [req.id]: [
        ...(prev[req.id] || []),
        { name: currentUser?.fullName || currentUser?.name || "You", city: currentUser?.city || "" },
      ],
    }));

    try {
      await axios.post("http://127.0.0.1:5000/api/requests/accept", {
        request_id: req.id,
        donor_id: currentUser?.id,
        donor_name: currentUser?.fullName || currentUser?.name,
        donor_city: currentUser?.city,
      });
    } catch (err) {
      console.error(err);
    }

    setSelectedRequest(null);
  };

  const getButtonState = (reqId) => {
    if (accepted[reqId]) return { label: "Accepted ✓", disabled: true, action: () => {} };
    if (!cycleComplete) return { label: "Not Eligible Yet", disabled: true, action: () => {} };
    if (screeningPassed !== true) return { label: "Take Screening Test", disabled: false, action: onStartScreening };
    return { label: "I Can Help", disabled: false, action: null }; // opens confirm modal, handled inline below
  };

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-4">Requests From Blood Banks</h2>
      <div className="flex flex-col gap-3">
        {sorted.length === 0 && (
          <div className="bg-paper border border-ink/10 rounded-[18px] p-6 text-center text-sm text-ink-soft">
            No active requests matching your blood group right now.
          </div>
        )}
        {sorted.map((r) => {
          const acceptedByList = r.acceptedBy || localAcceptedBy[r.id] || [];
          const btn = getButtonState(r.id);

          return (
            <div key={r.id} className="bg-paper border border-ink/10 rounded-[18px] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-sm">{r.bank} needs <span className="font-mono">{r.bloodGroup}</span></p>
                  <p className="text-xs text-ink-soft mt-1">{r.message}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${urgencyStyles[r.urgency]}`}>{r.urgency}</span>
                  <button
                    onClick={() => (btn.action ? btn.action() : setSelectedRequest(r))}
                    disabled={btn.disabled}
                    className={`text-xs font-bold px-4 py-2 rounded-full transition ${
                      accepted[r.id]
                        ? "bg-green/15 text-green cursor-default"
                        : btn.disabled
                        ? "bg-ink/10 text-ink-soft cursor-not-allowed"
                        : "bg-red-deep text-white hover:bg-red"
                    }`}
                  >
                    {btn.label}
                  </button>
                </div>
              </div>

              {acceptedByList.length > 0 && (
                <div className="mt-3 pt-3 border-t border-ink/10">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-ink-soft mb-1.5">
                    {acceptedByList.length} donor{acceptedByList.length > 1 ? "s" : ""} accepted
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {acceptedByList.map((donor, i) => (
                      <span key={i} className="text-xs bg-ink/5 px-2.5 py-1 rounded-full">
                        {donor.name} · {donor.city}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {selectedRequest && (
        <ConfirmDonationModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onConfirm={() => handleAccept(selectedRequest)}
        />
      )}
    </div>
  );
}

export default BloodBankRequests;