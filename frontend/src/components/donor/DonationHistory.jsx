function DonationHistory({ history }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-4">Donation History</h2>
      <div className="bg-paper border border-ink/10 rounded-[20px] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
              <th className="p-4">Date</th>
              <th className="p-4">Component</th>
              <th className="p-4">Volume</th>
              <th className="p-4">Blood Bank</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr><td colSpan="4" className="p-6 text-center text-ink-soft">No donation history yet.</td></tr>
            )}
            {history.map((h, i) => (
              <tr key={i} className="border-b border-ink/5 last:border-0">
                <td className="p-4 font-semibold">{h.date}</td>
                <td className="p-4">{h.component}</td>
                <td className="p-4">{h.volume}</td>
                <td className="p-4 text-ink-soft">{h.bank}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DonationHistory;