/** Accessible checkbox with text label. */
export default function Checkbox({ label, id, className = "", ...props }) { const inputId = id || props.name; return <label htmlFor={inputId} className={`flex cursor-pointer items-start gap-2 text-sm text-ink ${className}`}><input id={inputId} type="checkbox" className="mt-0.5 h-4 w-4 accent-red" {...props}/><span>{label}</span></label>; }
