import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "./Input";
export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={props.className} autoComplete={props.autoComplete || "new-password"} />
      <button type="button" onClick={() => setVisible(!visible)}
        className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
        aria-label={visible ? "Hide password" : "Show password"}>
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
