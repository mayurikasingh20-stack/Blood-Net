import { useState } from "react";
import Input from "./Input";
/** Password field with an optional visibility toggle. */
export default function PasswordInput(props) { const [visible, setVisible] = useState(false); return <div className="relative"><Input {...props} type={visible ? "text" : "password"} className={props.className}/><button type="button" onClick={() => setVisible(!visible)} className="absolute right-3 top-9 text-xs font-semibold text-ink-soft hover:text-red-deep" aria-label={visible ? "Hide password" : "Show password"}>{visible ? "Hide" : "Show"}</button></div>; }
