import { CalendarDays, MapPin } from "lucide-react";

function CampsList({ camps }) {
  return (
    <div>
      <h2 className="font-serif text-2xl font-semibold mb-4">Upcoming Blood Camps Near You</h2>
      {camps.length === 0 ? (
        <div className="bg-paper border border-ink/10 rounded-[20px] p-8 text-center text-sm text-ink-soft">
          No upcoming camps found right now.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {camps.map((camp) => (
            <div key={camp.id} className="bg-paper border border-ink/10 rounded-[18px] p-6">
              <h4 className="font-semibold">{camp.title}</h4>
              <p className="flex items-center gap-2 text-xs text-ink-soft mt-2">
                <CalendarDays size={13} /> {camp.date} · {camp.time}
              </p>
              <p className="flex items-center gap-2 text-xs text-ink-soft mt-1">
                <MapPin size={13} /> {camp.venue}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CampsList;