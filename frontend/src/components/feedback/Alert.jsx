export default function Alert({ children, tone = "info", title, className = "", role = "status" }) {
  const tones = {
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-green/30 bg-green/10 text-green",
    error: "border-red/20 bg-red/10 text-red",
    warning: "border-amber/30 bg-amber/10 text-amber-800",
  };
  return (
    <div role={role} className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]} ${className}`}>
      {title && <p className="mb-1 font-bold">{title}</p>}
      {children}
    </div>
  );
}