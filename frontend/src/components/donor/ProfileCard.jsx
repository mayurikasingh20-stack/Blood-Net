import { Droplet, MapPin, Phone, Mail } from "lucide-react";

function ProfileCard({ donor }) {
  return (
    <div className="bg-paper border border-ink/10 rounded-[22px] p-7">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-red/10 text-red-deep flex items-center justify-center font-mono font-bold text-xl">
          {donor.bloodGroup}
        </div>
        <div>
          <h3 className="font-serif text-xl font-semibold">{donor.fullName}</h3>
          <p className="text-sm text-ink-soft">{donor.totalDonations} donations · {donor.city}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 text-sm">
        <p className="flex items-center gap-2 text-ink-soft"><Phone size={14} /> {donor.phone}</p>
        <p className="flex items-center gap-2 text-ink-soft"><Mail size={14} /> {donor.email}</p>
        <p className="flex items-center gap-2 text-ink-soft"><MapPin size={14} /> {donor.city}</p>
        <p className="flex items-center gap-2 text-ink-soft">
          <Droplet size={14} /> Last donated: {donor.lastDonationDate}
        </p>
      </div>

      {donor.healthNotes.length > 0 && (
        <div className="mt-5 pt-5 border-t border-ink/10">
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft mb-2">Recent Health Updates</p>
          {donor.healthNotes.map((n, i) => (
            <p key={i} className="text-xs text-ink-soft">{n.date} — {n.note}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfileCard;