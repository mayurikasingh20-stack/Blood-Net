export default function Card({ children, className = "", padding = "md", as: Tag = "section", ...props }) {
  const pads = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };
  return (
    <Tag className={`bg-white rounded-2xl border border-slate-100 shadow-sm ${pads[padding]} ${className}`} {...props}>
      {children}
    </Tag>
  );
}