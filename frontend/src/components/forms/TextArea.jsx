export default function TextArea({ label, error, hint, id, className = "", required, rows = 4, ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-red">*</span>}
      </span>
      <textarea
        id={inputId}
        required={required}
        rows={rows}
        aria-invalid={Boolean(error)}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red focus:outline-none focus:ring-2 focus:ring-red/20"
        {...props}
      />
      {error ? (
        <span className="mt-1 block text-xs text-red">{error}</span>
      ) : hint && (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}