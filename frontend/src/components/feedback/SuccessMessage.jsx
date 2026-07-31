import Alert from "./Alert";
export default function SuccessMessage({ children, ...props }) { return <Alert tone="success" {...props}>{children}</Alert>; }
