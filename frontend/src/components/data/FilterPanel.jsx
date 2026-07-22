import Card from "../ui/Card";
import Button from "../ui/Button";
/** Composes caller-supplied filter fields and exposes apply/reset callbacks. */
export default function FilterPanel({ children, onApply, onReset, title = "Filters", className = "" }) { return <Card className={className}><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2>{onReset && <Button variant="ghost" size="sm" onClick={onReset}>Clear</Button>}</div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>{onApply && <div className="mt-4"><Button size="sm" onClick={onApply}>Apply filters</Button></div>}</Card>; }
