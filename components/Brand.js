import { Sparkles } from "lucide-react";
import Image from "next/image";

export function Brand({ dark = false }) {
  return (
    <span className={`brand-logo${dark ? " brand-logo-dark" : ""}`}>
      <Image
        src="/listingloom-logo.png"
        alt="ListingLoom — Weave raw product details into high-ranking, high-converting listings"
        width={760}
        height={760}
      />
    </span>
  );
}

export function SparkleMark({ size = 17 }) {
  return <Sparkles size={size} strokeWidth={1.8} />;
}
