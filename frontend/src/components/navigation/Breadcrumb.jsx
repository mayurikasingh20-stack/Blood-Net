import { Link } from "react-router-dom";

// Shows the user's current location. The last item is plain text.
export default function Breadcrumb({ items = [] }) {
  return <nav aria-label="Breadcrumb" className="mb-5 text-sm"><ol className="flex flex-wrap items-center gap-2 text-ink-soft">{items.map((item, index) => <li key={`${item.label}-${index}`} className="flex items-center gap-2">{index > 0 && <span aria-hidden="true">/</span>}{item.to && index !== items.length - 1 ? <Link to={item.to} className="hover:text-red-deep hover:underline">{item.label}</Link> : <span aria-current={index === items.length - 1 ? "page" : undefined} className={index === items.length - 1 ? "font-semibold text-ink" : ""}>{item.label}</span>}</li>)}</ol></nav>;
}
