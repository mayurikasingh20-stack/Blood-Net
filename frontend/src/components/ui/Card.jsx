/** Surface container for grouped content. */
export default function Card({ children, className = "", padding = "md", as: Tag = "section", ...props }) { const pads = { none: "", sm: "p-4", md: "p-5", lg: "p-6" }; return <Tag className={`rounded-xl border border-ink/10 bg-paper shadow-sm ${pads[padding]} ${className}`} {...props}>{children}</Tag>; }
