import Card from "../ui/Card";

// Highlights a number such as total donors, requests, or units available.
export default function StatisticsCard({ label, value, icon, change, className = "" }) { return <Card className={className}><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-ink-soft">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p>{change && <p className="mt-2 text-xs font-semibold text-green">{change}</p>}</div>{icon && <span className="rounded-lg bg-red/10 p-3 text-red-deep">{icon}</span>}</div></Card>; }
