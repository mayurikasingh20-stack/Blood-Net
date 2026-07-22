import { useState } from "react";
import { Heart, X } from "lucide-react";

function ConfirmDonationModal({ request, onClose, onConfirm }) {
  const [confirming, setConfirming] = useState(false);

  const handleConfirmClick = () => {
    if (confirming) return; // guard against rapid double-clicks
    setConfirming(true);
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 px-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-7">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-full">
              <Heart className="text-red-600" size={22} />
            </div>
            <div>
              <h2 className="font-semibold text-lg">Confirm Donation</h2>
              <p className="text-sm text-gray-500">Please read before accepting.</p>
            </div>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="space-y-3 text-sm">
          <p>You are volunteering to donate blood for:</p>

          <div className="bg-gray-100 rounded-xl p-4">
            <p><strong>Hospital:</strong> {request.bank}</p>
            <p><strong>Blood Group:</strong> {request.bloodGroup}</p>
            <p><strong>Urgency:</strong> {request.urgency}</p>
          </div>

          <div className="bg-red-50 rounded-xl p-4">
            <p>✓ You are healthy.</p>
            <p>✓ You are willing to visit the hospital.</p>
            <p>✓ You will complete the required blood tests before donation.</p>
          </div>
        </div>

        <div className="flex gap-3 mt-7">
          <button onClick={onClose} disabled={confirming} className="flex-1 border rounded-full py-3 font-semibold disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={confirming}
            className="flex-1 bg-red-600 text-white rounded-full py-3 font-semibold hover:bg-red-700 disabled:opacity-60"
          >
            {confirming ? "Confirming..." : "Confirm Donation"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDonationModal;