import Alert from "./Alert";
/** Error alert for failed actions or invalid page-level states. */
export default function ErrorMessage({ children, ...props }) { return <Alert tone="error" role="alert" {...props}>{children}</Alert>; }
