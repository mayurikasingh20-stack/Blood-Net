import Alert from "./Alert";
export default function ErrorMessage({ children, ...props }) { return <Alert tone="error" role="alert" {...props}>{children}</Alert>; }
