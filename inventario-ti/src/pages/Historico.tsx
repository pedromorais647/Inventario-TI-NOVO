import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { LogEquip, LogEstoque } from "../lib/tipos";
import { dataHora } from "../lib/util";
import { exportarCSV, exportarExcel, exportarPDF } from "../lib/exportar";
import { Exportar, Vazio } from "../components/Ui";

export default function Historico() {
  const [aba, setAba] = useState<"estoque" | "equip">("estoque");
  const [le, setLe] = useState<LogEstoque[]>([]); const [lq, setLq] = useState<LogEquip[]>([]);
  useEffect(() => {
    supabase.from("estoque_logs").select("*").order("criado_em", { ascending: false }).limit(500).then(({ data }) => setLe((data as LogEstoque[]) ?? []));
    supabase.from("equipamentos_logs").select("*").order("criado_em", { ascending: false }).limit(500).then(({ data }) => setLq((data as LogEquip[]) ?? []));
  }, []);

  const tabela = () => aba === "estoque"
    ? { titulo: "Histórico do estoque", arquivo: "historico-estoque", cabecalho: ["Data/hora", "Item", "Descrição", "Qtd.", "Tipo", "Detalhes", "Usuário"], linhas: le.map((l) => [dataHora(l.criado_em), l.nome, l.descricao, l.quantidade, l.tipo, l.detalhes, l.usuario]) }
    : { titulo: "Histórico de equipamentos", arquivo: "historico-equipamentos", cabecalho: ["Data/hora", "Equipamento", "Ação", "Detalhes", "Usuário"], linhas: lq.map((l) => [dataHora(l.criado_em), l.equipamento_nome, l.acao, l.detalhes, l.usuario]) };

  const Aba = ({ id, rotulo }: { id: "estoque" | "equip"; rotulo: string }) => (
    <button onClick={() => setAba(id)} className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${aba === id ? "bg-folha-600 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200"}`}>{rotulo}</button>
  );
  const corTipo = (t: string) => t === "Entrada" ? "bg-folha-100 text-folha-800" : t === "Saída" ? "bg-laranja-100 text-laranja-600" : t === "Exclusão" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-folha-900">Histórico</h1><p className="text-sm text-slate-500">Horários no fuso de Brasília. Mostra os 500 registros mais recentes.</p></div>
        <Exportar csv={() => exportarCSV(tabela())} excel={() => exportarExcel(tabela())} pdf={() => exportarPDF(tabela())} />
      </div>
      <div className="flex gap-2"><Aba id="estoque" rotulo="Estoque de tintas" /><Aba id="equip" rotulo="Equipamentos" /></div>
      <div className="card overflow-x-auto">
        {aba === "estoque" ? (
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50"><tr>{["Data/hora", "Item", "Qtd.", "Tipo", "Detalhes", "Usuário"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{le.map((l) => (
              <tr key={l.id}><td className="td whitespace-nowrap">{dataHora(l.criado_em)}</td><td className="td">{l.nome} {l.descricao}</td><td className="td">{l.quantidade}</td>
                <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${corTipo(l.tipo)}`}>{l.tipo}</span></td><td className="td">{l.detalhes}</td><td className="td">{l.usuario}</td></tr>))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50"><tr>{["Data/hora", "Equipamento", "Ação", "Detalhes", "Usuário"].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{lq.map((l) => (
              <tr key={l.id}><td className="td whitespace-nowrap">{dataHora(l.criado_em)}</td><td className="td">{l.equipamento_nome}</td><td className="td">{l.acao}</td><td className="td">{l.detalhes}</td><td className="td">{l.usuario}</td></tr>))}
            </tbody>
          </table>
        )}
        {(aba === "estoque" ? le.length : lq.length) === 0 && <Vazio>Nenhum registro ainda.</Vazio>}
      </div>
    </div>
  );
}
