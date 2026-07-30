export default function Select({ label, options = [], placeholder = "Select an option", error, id, className = "", required, ...props }) {
  const inputId = id || props.name;
  return (
    <label className={`block ${className}`} htmlFor={inputId}>
      <span className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}{required && <span className="ml-1 text-red">*</span>}
      </span>
      <select
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm transition hover:border-slate-300 focus:border-red focus:outline-none focus:ring-2 focus:ring-red/20"
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>
        ))}
      </select>
      {error && <span className="mt-1 block text-xs text-red">{error}</span>}
    </label>
  );
}