import { useEffect, type ReactNode } from "react";
import { Download, X } from "lucide-react";
import { useState } from "react";

export function Modal({ titulo, aberto, fechar, children }: { titulo: string; aberto: boolean; fechar: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!aberto) return;
    const f = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", f);
    return () => window.removeEventListener("keydown", f);
  }, [aberto, fechar]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 sm:items-center sm:p-4" onMouseDown={fechar}>
      <div role="dialog" aria-modal="true" aria-label={titulo} onMouseDown={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{titulo}</h2>
          <button onClick={fechar} className="rounded p-1 text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Campo({ rotulo, children }: { rotulo: string; children: ReactNode }) {
  return <label className="block"><span className="label">{rotulo}</span>{children}</label>;
}

export function Aviso({ tipo = "erro", children }: { tipo?: "erro" | "ok" | "info"; children: ReactNode }) {
  const cor = tipo === "erro" ? "border-red-200 bg-red-50 text-red-800" : tipo === "ok" ? "border-folha-200 bg-folha-50 text-folha-800" : "border-amber-200 bg-amber-50 text-amber-900";
  return <div role="alert" className={`rounded-lg border px-3 py-2 text-sm ${cor}`}>{children}</div>;
}

export function Exportar({ csv, excel, pdf }: { csv: () => void; excel: () => void; pdf: () => void }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="relative">
      <button className="btn-ghost" onClick={() => setAberto(!aberto)} aria-expanded={aberto}><Download size={16} /> Exportar</button>
      {aberto && (
        <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg" onMouseLeave={() => setAberto(false)}>
          {[["CSV", csv], ["Excel (.xlsx)", excel], ["PDF", pdf]].map(([n, f]) => (
            <button key={n as string} className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50" onClick={() => { (f as () => void)(); setAberto(false); }}>{n as string}</button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Vazio({ children }: { children: ReactNode }) {
  return <div className="px-4 py-10 text-center text-sm text-slate-500">{children}</div>;
}
