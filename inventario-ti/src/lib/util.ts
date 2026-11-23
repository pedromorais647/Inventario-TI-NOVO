const TZ = "America/Sao_Paulo";

export function dataHora(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
export function soData(iso: string | null | undefined): string {
  if (!iso) return "—";
  // datas puras (aaaa-mm-dd) não sofrem conversão de fuso
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) { const [a, m, d] = iso.split("-"); return `${d}/${m}/${a}`; }
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: TZ });
}
export function hojeISO(): string {
  const p = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
  return p; // aaaa-mm-dd
}
export function baixar(nome: string, conteudo: BlobPart, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = document.createElement("a"); a.href = url; a.download = nome; a.click(); URL.revokeObjectURL(url);
}
export function csvDe(linhas: (string | number | null | undefined)[][]): string {
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return "﻿" + linhas.map((l) => l.map(esc).join(";")).join("\r\n");
}
