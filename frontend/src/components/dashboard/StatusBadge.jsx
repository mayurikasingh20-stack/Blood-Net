import Badge from "../ui/Badge";

// Maps common status names to a consistent badge color.
export default function StatusBadge({ status }) { const value = String(status || "unknown"); const tones = { active: "success", approved: "success", completed: "success", pending: "warning", processing: "warning", rejected: "danger", cancelled: "danger" }; return <Badge tone={tones[value.toLowerCase()] || "neutral"}>{value}</Badge>; }
