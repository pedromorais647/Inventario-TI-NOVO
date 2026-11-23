import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Droplets, Monitor, Printer } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Equipamento, ItemEstoque } from "../lib/tipos";
import { dataHora } from "../lib/util";

export default function Painel() {
  const [eq, setEq] = useState<Equipamento[]>([]);
  const [it, setIt] = useState<ItemEstoque[]>([]);
  useEffect(() => {
    supabase.from("equipamentos").select("*").then(({ data }) => setEq((data as Equipamento[]) ?? []));
    supabase.from("estoque_itens").select("*").order("nome").then(({ data }) => setIt((data as ItemEstoque[]) ?? []));
  }, []);
  const maquinas = eq.filter((e) => e.categoria !== "Impressora").length;
  const impressoras = eq.filter((e) => e.categoria === "Impressora").length;
  const total = it.reduce((s, x) => s + x.quantidade, 0);
  const baixos = it.filter((x) => x.quantidade <= 1);
  const recentes = [...eq].sort((a, b) => (b.ultima_atualizacao ?? "").localeCompare(a.ultima_atualizacao ?? "")).slice(0, 6);

  const Cartao = ({ icone: I, rotulo, valor, para }: { icone: typeof Monitor; rotulo: string; valor: number; para: string }) => (
    <Link to={para} className="card flex items-center gap-4 p-4 transition hover:border-folha-500">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-folha-100 text-folha-700"><I size={24} /></span>
      <span><span className="block text-3xl font-extrabold text-folha-900">{valor}</span><span className="text-sm text-slate-500">{rotulo}</span></span>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-extrabold text-folha-900">Painel</h1><p className="text-sm text-slate-500">Visão geral do parque de TI e do estoque de tintas.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Cartao icone={Monitor} rotulo="Máquinas (computadores e notebooks)" valor={maquinas} para="/equipamentos" />
        <Cartao icone={Printer} rotulo="Impressoras" valor={impressoras} para="/equipamentos" />
        <Cartao icone={Droplets} rotulo="Unidades de tinta e toner" valor={total} para="/estoque" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 font-bold text-slate-900">Estoque baixo</h2>
          {baixos.length === 0 ? <p className="text-sm text-slate-500">Nenhum item com 1 unidade ou menos.</p> : (
            <ul className="divide-y divide-slate-100 text-sm">
              {baixos.map((x) => <li key={x.id} className="flex justify-between py-2"><span>{x.nome} {x.descricao}</span><b className={x.quantidade === 0 ? "text-red-600" : "text-laranja-600"}>{x.quantidade}</b></li>)}
            </ul>
          )}
        </section>
        <section className="card p-4">
          <h2 className="mb-3 font-bold text-slate-900">Atualizados recentemente</h2>
          <ul className="divide-y divide-slate-100 text-sm">
            {recentes.map((x) => <li key={x.id} className="flex justify-between py-2"><span>{x.nome} <span className="text-slate-500">· {x.setor ?? "—"}</span></span><span className="text-slate-500">{dataHora(x.ultima_atualizacao).slice(0, 10)}</span></li>)}
          </ul>
        </section>
      </div>
    </div>
  );
}
