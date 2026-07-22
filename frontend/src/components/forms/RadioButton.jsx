/** Accessible radio option; group options by sharing name. */
export default function RadioButton({ label, id, className = "", ...props }) { const inputId = id || props.value; return <label htmlFor={inputId} className={`flex cursor-pointer items-center gap-2 text-sm ${className}`}><input id={inputId} type="radio" className="h-4 w-4 accent-red" {...props}/>{label}</label>; }
