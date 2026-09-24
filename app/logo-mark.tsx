import Image from "next/image";

export default function LogoMark({ className = "" }: { className?: string }) {
  return <span className={`logo-mark ${className}`} aria-hidden="true">
    <Image src="/apartmanos-icon.png" alt="" width={256} height={256}/>
  </span>;
}
