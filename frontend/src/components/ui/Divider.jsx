/** Horizontal or vertical visual separator. */
export default function Divider({ orientation = "horizontal", className = "" }) { return <div role="separator" aria-orientation={orientation} className={`${orientation === "vertical" ? "h-full w-px" : "h-px w-full"} bg-ink/10 ${className}`} />; }
