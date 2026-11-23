import { useState } from "react";

function Logo({ src, alt, fallback, className }: { src: string; alt: string; fallback: string; className: string }) {
  const [falhou, setFalhou] = useState(false);
  if (falhou) return <span className="text-sm font-extrabold tracking-tight text-folha-800">{fallback}</span>;
  return <img src={src} alt={alt} className={className} onError={() => setFalhou(true)} />;
}

export function Logos({ altura = "h-9" }: { altura?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Logo src="/logos/simonetti.png" alt="Simonetti Citrus" fallback="Simonetti Citrus" className={`${altura} w-auto object-contain`} />
      <span className="h-6 w-px bg-slate-300" aria-hidden />
      <Logo src="/logos/petrus.png" alt="Petrus Tech" fallback="Petrus Tech" className={`${altura} w-auto object-contain`} />
    </div>
  );
}
