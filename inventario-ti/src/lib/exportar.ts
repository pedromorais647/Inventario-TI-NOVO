import { baixar, csvDe } from "./util";

type Tabela = { titulo: string; arquivo: string; cabecalho: string[]; linhas: (string | number | null | undefined)[][] };

export function exportarCSV(t: Tabela) {
  baixar(`${t.arquivo}.csv`, csvDe([t.cabecalho, ...t.linhas]), "text/csv;charset=utf-8");
}
export async function exportarExcel(t: Tabela) {
  const XLSX = await import("xlsx");
  const ws = XLSX.utils.aoa_to_sheet([t.cabecalho, ...t.linhas.map((l) => l.map((v) => v ?? ""))]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, t.titulo.slice(0, 30));
  XLSX.writeFile(wb, `${t.arquivo}.xlsx`);
}
export async function exportarPDF(t: Tabela) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  const doc = new jsPDF({ orientation: "landscape" });
  doc.setFontSize(14); doc.text(t.titulo, 14, 14);
  doc.setFontSize(9); doc.text(`Simonetti Citrus - gerado em ${new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`, 14, 20);
  autoTable(doc, { startY: 25, head: [t.cabecalho], body: t.linhas.map((l) => l.map((v) => String(v ?? ""))), styles: { fontSize: 8 }, headStyles: { fillColor: [47, 127, 68] } });
  doc.save(`${t.arquivo}.pdf`);
}
