/** Action button with accessible loading and variant states. */
export default function Button({ children, variant = "primary", size = "md", loading = false, className = "", type = "button", disabled, ...props }) {
  const variants = { primary: "bg-red text-white hover:bg-red-deep", secondary: "bg-ink text-white hover:bg-ink/90", outline: "border border-red text-red-deep hover:bg-red/10", ghost: "text-ink hover:bg-ink/5", danger: "bg-red-700 text-white hover:bg-red-800" };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2.5 text-sm", lg: "px-5 py-3 text-base" };
  return <button type={type} disabled={disabled || loading} aria-busy={loading} className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{loading && <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}{children}</button>;
}
