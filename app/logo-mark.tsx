import { Building2 } from "lucide-react";

export default function LogoMark({ className = "" }: { className?: string }) {
  return <span className={`logo-mark ${className}`} aria-hidden="true">
    <Building2 strokeWidth={2.25}/>
    <i/>
  </span>;
}
