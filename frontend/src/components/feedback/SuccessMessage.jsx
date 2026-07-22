import Alert from "./Alert";
/** Positive completion alert. */
export default function SuccessMessage({ children, ...props }) { return <Alert tone="success" {...props}>{children}</Alert>; }
