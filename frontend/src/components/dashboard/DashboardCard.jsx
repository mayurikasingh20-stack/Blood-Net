import Card from "../ui/Card";

// General dashboard section card with heading and optional action.
export default function DashboardCard({ title, children, action, className = "" }) { return <Card className={className}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-serif text-lg font-bold">{title}</h2>{action}</div>{children}</Card>; }
