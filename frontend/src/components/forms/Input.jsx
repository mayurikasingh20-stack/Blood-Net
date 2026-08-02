export default function Input({ label, error, hint, id, className = "", required, endAdornment, ...props }) {
  const inputId = id || props.name;
  const inputEl = (
    <input
      id={inputId}
      required={required}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${inputId}-error` : undefined}
      className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-red focus:outline-none focus:ring-2 focus:ring-red/20 ${endAdornment ? "pr-11" : ""}`}
      {...props}
    />
  );
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-red" aria-hidden="true">*</span>}
      </span>
      {endAdornment ? (
        <div className="relative">
          {inputEl}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>
        </div>
      ) : (
        inputEl
      )}
      {error ? (
        <span id={`${inputId}-error`} className="mt-1 block text-xs text-red">{error}</span>
      ) : hint && (
        <span className="mt-1 block text-xs text-slate-500">{hint}</span>
      )}
    </label>
  );
}