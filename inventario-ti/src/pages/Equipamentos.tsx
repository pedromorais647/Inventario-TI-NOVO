import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Pencil, Plus, Search, Trash2, Wrench } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { Equipamento } from "../lib/tipos";
import { hojeISO, soData } from "../lib/util";
import { exportarCSV, exportarExcel, exportarPDF } from "../lib/exportar";
import { Aviso, Campo, Exportar, Modal, Vazio } from "../components/Ui";

const VAZIO = { nome: "", tipo: "", setor: "", status: "Ativo", anydesk: "", ultima_manutencao: "", categoria: "Computador" as Equipamento["categoria"] };

export default function Equipamentos() {
  const { podeEditar } = useAuth();
  const [lista, setLista] = useState<Equipamento[]>([]);
  const [busca, setBusca] = useState(""); const [cat, setCat] = useState("Todos");
  const [form, setForm] = useState<typeof VAZIO & { id?: number }>(VAZIO); const [editando, setEditando] = useState(false);
  const [servico, setServico] = useState<Equipamento | null>(null);
  const [sv, setSv] = useState({ data: hojeISO(), tipo: "Preventiva", descricao: "" });
  const [excluir, setExcluir] = useState<Equipamento | null>(null);
  const [erro, setErro] = useState(""); const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("equipamentos").select("*").order("id");
    setLista((data as Equipamento[]) ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const filtrada = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return lista.filter((e) =>
      (cat === "Todos" || (cat === "Máquinas" ? e.categoria !== "Impressora" : e.categoria === "Impressora")) &&
      (!q || [e.nome, e.tipo, e.setor, e.status, e.anydesk, e.ultima_manutencao].some((v) => (v ?? "").toLowerCase().includes(q))));
  }, [lista, busca, cat]);

  const tabela = () => ({
    titulo: "Equipamentos", arquivo: "equipamentos",
    cabecalho: ["ID", "Nome", "Tipo", "Setor", "Status", "AnyDesk / ID", "Última manutenção", "Última atualização"],
    linhas: filtrada.map((e) => [e.id, e.nome, e.tipo, e.setor, e.status, e.anydesk, e.ultima_manutencao, soData(e.ultima_atualizacao)]),
  });

  function abrirNovo() { setForm(VAZIO); setErro(""); setEditando(true); }
  function abrirEditar(e: Equipamento) {
    setForm({ id: e.id, nome: e.nome, tipo: e.tipo ?? "", setor: e.setor ?? "", status: e.status ?? "", anydesk: e.anydesk ?? "", ultima_manutencao: e.ultima_manutencao ?? "", categoria: e.categoria });
    setErro(""); setEditando(true);
  }
  async function salvar(ev: FormEvent) {
    ev.preventDefault(); setErro(""); setOcupado(true);
    const { id, ...c } = form;
    const dados = { ...c, tipo: c.tipo || null, setor: c.setor || null, status: c.status || null, anydesk: c.anydesk || null, ultima_manutencao: c.ultima_manutencao || null };
    const { error } = id ? await supabase.from("equipamentos").update(dados).eq("id", id) : await supabase.from("equipamentos").insert(dados);
    setOcupado(false);
    if (error) return setErro(error.message);
    setEditando(false); carregar();
  }
  async function salvarServico(ev: FormEvent) {
    ev.preventDefault(); if (!servico) return; setErro(""); setOcupado(true);
    const { error } = await supabase.rpc("registrar_servico", { p_equip: servico.id, p_data: sv.data, p_tipo: sv.tipo, p_descricao: sv.descricao });
    setOcupado(false);
    if (error) return setErro(error.message);
    setServico(null); carregar();
  }
  async function confirmarExcluir() {
    if (!excluir) return; setOcupado(true);
    const { error } = await supabase.from("equipamentos").delete().eq("id", excluir.id);
    setOcupado(false);
    if (error) return setErro(error.message);
    setExcluir(null); carregar();
  }
  const set = (k: keyof typeof VAZIO) => (e: { target: { value: string } }) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-folha-900">Equipamentos</h1><p className="text-sm text-slate-500">{filtrada.length} de {lista.length} itens</p></div>
        <div className="flex gap-2">
          <Exportar csv={() => exportarCSV(tabela())} excel={() => exportarExcel(tabela())} pdf={() => exportarPDF(tabela())} />
          {podeEditar && <button className="btn-primary" onClick={abrirNovo}><Plus size={16} /> Novo equipamento</button>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input className="input pl-9" placeholder="Buscar por nome, setor, AnyDesk…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar" />
        </div>
        <select className="input w-auto" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filtrar por tipo">
          <option>Todos</option><option>Máquinas</option><option>Impressoras</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="border-b border-slate-200 bg-slate-50"><tr>
            {["Nome", "Tipo", "Setor", "Status", "AnyDesk / ID", "Última manutenção", "Atualizado", ""].map((h) => <th key={h} className="th">{h}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtrada.map((e) => (
              <tr key={e.id} className="hover:bg-folha-50/40">
                <td className="td font-semibold">{e.nome}</td><td className="td">{e.tipo ?? ""}</td><td className="td">{e.setor ?? ""}</td>
                <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${(e.status ?? "").toLowerCase() === "ativo" ? "bg-folha-100 text-folha-800" : "bg-laranja-100 text-laranja-600"}`}>{e.status}</span></td>
                <td className="td font-mono text-xs">{e.anydesk ?? ""}</td><td className="td">{e.ultima_manutencao ?? ""}</td><td className="td whitespace-nowrap">{soData(e.ultima_atualizacao)}</td>
                <td className="td whitespace-nowrap text-right">
                  {podeEditar && <>
                    <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100" title="Registrar serviço" aria-label={`Registrar serviço em ${e.nome}`} onClick={() => { setSv({ data: hojeISO(), tipo: e.categoria === "Impressora" ? "Tinta" : "Preventiva", descricao: "" }); setErro(""); setServico(e); }}><Wrench size={16} /></button>
                    <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100" title="Editar" aria-label={`Editar ${e.nome}`} onClick={() => abrirEditar(e)}><Pencil size={16} /></button>
                    <button className="rounded p-1.5 text-red-600 hover:bg-red-50" title="Excluir" aria-label={`Excluir ${e.nome}`} onClick={() => { setErro(""); setExcluir(e); }}><Trash2 size={16} /></button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtrada.length === 0 && <Vazio>Nenhum equipamento encontrado. Ajuste a busca ou o filtro.</Vazio>}
      </div>

      <Modal titulo={form.id ? "Editar equipamento" : "Novo equipamento"} aberto={editando} fechar={() => setEditando(false)}>
        <form onSubmit={salvar} className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><Campo rotulo="Nome"><input className="input" required value={form.nome} onChange={set("nome")} /></Campo></div>
          <Campo rotulo="Categoria"><select className="input" value={form.categoria} onChange={set("categoria")}><option>Computador</option><option>Notebook</option><option>Impressora</option><option>Outro</option></select></Campo>
          <Campo rotulo="Tipo / modelo"><input className="input" value={form.tipo} onChange={set("tipo")} /></Campo>
          <Campo rotulo="Setor / responsável"><input className="input" value={form.setor} onChange={set("setor")} /></Campo>
          <Campo rotulo="Status"><input className="input" value={form.status} onChange={set("status")} /></Campo>
          <div className="sm:col-span-2"><Campo rotulo="AnyDesk / ID"><input className="input" value={form.anydesk} onChange={set("anydesk")} /></Campo></div>
          <div className="sm:col-span-2"><Campo rotulo="Última manutenção"><input className="input" value={form.ultima_manutencao} onChange={set("ultima_manutencao")} placeholder="Ex.: 24/10/2026 Preventiva" /></Campo></div>
          {erro && <div className="sm:col-span-2"><Aviso>{erro}</Aviso></div>}
          <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setEditando(false)}>Cancelar</button><button className="btn-primary" disabled={ocupado}>Salvar</button></div>
        </form>
      </Modal>

      <Modal titulo={`Registrar serviço · ${servico?.nome ?? ""}`} aberto={!!servico} fechar={() => setServico(null)}>
        <form onSubmit={salvarServico} className="space-y-3">
          <Campo rotulo="Data"><input className="input" type="date" required value={sv.data} onChange={(e) => setSv({ ...sv, data: e.target.value })} /></Campo>
          <Campo rotulo="Tipo"><select className="input" value={sv.tipo} onChange={(e) => setSv({ ...sv, tipo: e.target.value })}><option>Preventiva</option><option>Tinta</option><option>Toner</option><option>Outro</option></select></Campo>
          <Campo rotulo="Descrição"><input className="input" value={sv.descricao} onChange={(e) => setSv({ ...sv, descricao: e.target.value })} placeholder="Ex.: Completado tinta e limpeza do cabeçote" /></Campo>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setServico(null)}>Cancelar</button><button className="btn-primary" disabled={ocupado}>Registrar serviço</button></div>
        </form>
      </Modal>

      <Modal titulo="Excluir equipamento" aberto={!!excluir} fechar={() => setExcluir(null)}>
        <p className="mb-4 text-sm">Excluir <b>{excluir?.nome}</b> ({excluir?.setor ?? "sem setor"})? Essa ação não pode ser desfeita.</p>
        {erro && <Aviso>{erro}</Aviso>}
        <div className="mt-3 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setExcluir(null)}>Cancelar</button><button className="btn-danger" disabled={ocupado} onClick={confirmarExcluir}>Excluir equipamento</button></div>
      </Modal>
    </div>
  );
}
