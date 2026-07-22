import { useState, useEffect } from "react";
import { Droplet } from "lucide-react";

const statusStyles = {
  full: { label: "Full", color: "bg-green/10 text-green" },
  moderate: { label: "Moderate", color: "bg-amber/15 text-[#8A5A15]" },
  low: { label: "Low", color: "bg-red/10 text-red-deep" },
  empty: { label: "Empty", color: "bg-ink/10 text-ink-soft" },
};

function InventoryPanel() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/inventory")
      .then((res) => res.json())
      .then((data) => setInventory(data))
      .catch(() => setInventory([]));
  }, []);

  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-4">Blood Bank Inventory — Jodhpur</h2>
      <div className="flex flex-col gap-4">
        {inventory.length === 0 && (
          <div className="bg-paper border border-ink/10 rounded-[18px] p-6 text-center text-sm text-ink-soft">
            Inventory data unavailable right now.
          </div>
        )}
        {inventory.map((bank) => (
          <div key={bank.bank} className="bg-paper border border-ink/10 rounded-[18px] p-6">
            <p className="font-semibold text-sm mb-3">{bank.bank}</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {Object.entries(bank.stock).map(([type, status]) => {
                const s = statusStyles[status] || statusStyles.empty;
                return (
                  <div key={type} className="border border-ink/10 rounded-xl p-2.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-mono font-bold text-xs">
                      <Droplet size={12} className="text-red-deep" /> {type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.color}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InventoryPanel;