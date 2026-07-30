export default function Button({ children, variant = "primary", size = "md", loading = false, className = "", type = "button", disabled, ...props }) {
  const variants = {
    primary: "bg-red text-white hover:bg-red-light shadow-md shadow-red/20",
    secondary: "bg-slate-800 text-white hover:bg-slate-700",
    outline: "border border-red text-red hover:bg-red/5",
    ghost: "text-slate-600 hover:bg-slate-100",
    danger: "bg-red-700 text-white hover:bg-red-800",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
}