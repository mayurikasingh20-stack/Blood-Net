import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

function UpdatePasswordModal({ onClose, onSave }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const passwordError = () => {
    if (!newPassword) return "";
    if (newPassword.length < 8) return "New password must be at least 8 characters.";
    if (!/[A-Z]/.test(newPassword)) return "Must include at least one uppercase letter.";
    if (!/[0-9]/.test(newPassword)) return "Must include at least one number.";
    return "";
  };

  const handleSubmit = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (passwordError()) {
      setError(passwordError());
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    onSave({ currentPassword, newPassword });
  };

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 px-4">
      <div className="bg-paper rounded-[22px] p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-serif text-xl font-semibold">Update Password</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Current Password</label>
            <div className="relative">
              <input type={showCurrent ? "text" : "password"} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" />
              <button type="button" onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">New Password</label>
            <div className="relative">
              <input type={showNew ? "text" : "password"} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Confirm New Password</label>
            <div className="relative">
              <input type={showConfirm ? "text" : "password"} className="w-full px-4 py-2.5 pr-10 rounded-xl border border-ink/15 focus:outline-none focus:ring-2 focus:ring-red-300" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="w-1/3 border border-ink/15 font-semibold py-3 rounded-full hover:bg-ink/5 transition">Cancel</button>
          <button onClick={handleSubmit} className="w-2/3 bg-red-deep text-white font-semibold py-3 rounded-full hover:bg-red transition">Update Password</button>
        </div>
      </div>
    </div>
  );
}

export default UpdatePasswordModal;