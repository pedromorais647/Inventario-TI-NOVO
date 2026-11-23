import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDownToLine, ArrowUpFromLine, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { ItemEstoque } from "../lib/tipos";
import { dataHora } from "../lib/util";
import { exportarCSV, exportarExcel, exportarPDF } from "../lib/exportar";
import { Aviso, Campo, Exportar, Modal, Vazio } from "../components/Ui";

export default function Estoque() {
  const { podeEditar, podeImportar } = useAuth();
  const [itens, setItens] = useState<ItemEstoque[]>([]);
  const [aviso, setAviso] = useState<{ tipo: "erro" | "ok"; texto: string } | null>(null);
  const [mov, setMov] = useState<{ item: ItemEstoque; tipo: "Entrada" | "Saída" } | null>(null); const [qtd, setQtd] = useState(1);
  const [form, setForm] = useState<{ id?: number; nome: string; descricao: string; quantidade: number; categoria: "Tinta" | "Toner" } | null>(null);
  const [excluir, setExcluir] = useState<ItemEstoque | null>(null);
  const [erro, setErro] = useState(""); const [ocupado, setOcupado] = useState(false);
  const arquivo = useRef<HTMLInputElement>(null);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("estoque_itens").select("*").order("categoria").order("nome").order("descricao");
    setItens((data as ItemEstoque[]) ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const total = itens.reduce((s, i) => s + i.quantidade, 0);
  const tabela = () => ({
    titulo: "Estoque de tintas", arquivo: "estoque-tintas", cabecalho: ["Item", "Descrição", "Categoria", "Quantidade", "Última ação", "Atualizado em"],
    linhas: itens.map((i) => [i.nome, i.descricao, i.categoria, i.quantidade, i.ultima_acao, dataHora(i.atualizado_em)]),
  });

  async function movimentar(e: FormEvent) {
    e.preventDefault(); if (!mov) return; setErro(""); setOcupado(true);
    const { error } = await supabase.rpc("movimentar_estoque", { p_item: mov.item.id, p_tipo: mov.tipo, p_qtd: qtd });
    setOcupado(false);
    if (error) return setErro(error.message);
    setMov(null); carregar();
  }
  async function salvar(e: FormEvent) {
    e.preventDefault(); if (!form) return; setErro(""); setOcupado(true);
    const { id, ...dados } = form;
    const { error } = id ? await supabase.from("estoque_itens").update(dados).eq("id", id) : await supabase.from("estoque_itens").insert(dados);
    setOcupado(false);
    if (error) return setErro(error.code === "23505" ? "Já existe um item com esse nome e descrição." : error.message);
    setForm(null); carregar();
  }
  async function confirmarExcluir() {
    if (!excluir) return; setOcupado(true);
    const { error } = await supabase.from("estoque_itens").delete().eq("id", excluir.id);
    setOcupado(false);
    if (error) return setErro(error.message);
    setExcluir(null); carregar();
  }
  async function importar(f: File | undefined) {
    if (!f) return; setAviso(null);
    try {
      const j = JSON.parse(await f.text());
      const lista = Array.isArray(j) ? j : j.itens;
      const { data, error } = await supabase.rpc("importar_estoque", { p_itens: lista });
      if (error) throw error;
      setAviso({ tipo: "ok", texto: `${data} itens importados.` }); carregar();
    } catch (x) { setAviso({ tipo: "erro", texto: `Não foi possível importar: ${(x as Error).message}` }); }
    if (arquivo.current) arquivo.current.value = "";
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-folha-900">Estoque de tintas</h1><p className="text-sm text-slate-500">{itens.length} itens · {total} unidades no total</p></div>
        <div className="flex flex-wrap gap-2">
          <Exportar csv={() => exportarCSV(tabela())} excel={() => exportarExcel(tabela())} pdf={() => exportarPDF(tabela())} />
          {podeImportar && <>
            <input ref={arquivo} type="file" accept="application/json,.json" className="hidden" onChange={(e) => importar(e.target.files?.[0])} />
            <button className="btn-ghost" onClick={() => arquivo.current?.click()}><Upload size={16} /> Importar JSON</button>
          </>}
          {podeEditar && <button className="btn-primary" onClick={() => { setErro(""); setForm({ nome: "", descricao: "", quantidade: 0, categoria: "Tinta" }); }}><Plus size={16} /> Novo item</button>}
        </div>
      </div>
      {aviso && <Aviso tipo={aviso.tipo}>{aviso.texto}</Aviso>}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-slate-200 bg-slate-50"><tr>{["Item", "Descrição", "Qtd.", "Última ação", "Atualizado em", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {itens.map((i) => (
              <tr key={i.id} className="hover:bg-folha-50/40">
                <td className="td font-semibold">{i.nome}</td><td className="td">{i.descricao}</td>
                <td className="td"><b className={i.quantidade === 0 ? "text-red-600" : i.quantidade === 1 ? "text-laranja-600" : "text-folha-800"}>{i.quantidade}</b></td>
                <td className="td">{i.ultima_acao ?? "—"}</td><td className="td whitespace-nowrap">{dataHora(i.atualizado_em)}</td>
                <td className="td whitespace-nowrap text-right">
                  {podeEditar && <>
                    <button className="btn-ghost !px-2 !py-1" onClick={() => { setQtd(1); setErro(""); setMov({ item: i, tipo: "Entrada" }); }} aria-label={`Entrada de ${i.nome} ${i.descricao}`}><ArrowDownToLine size={15} /> Entrada</button>{" "}
                    <button className="btn-ghost !px-2 !py-1" onClick={() => { setQtd(1); setErro(""); setMov({ item: i, tipo: "Saída" }); }} aria-label={`Saída de ${i.nome} ${i.descricao}`}><ArrowUpFromLine size={15} /> Saída</button>{" "}
                    <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100" aria-label={`Editar ${i.nome}`} onClick={() => { setErro(""); setForm({ id: i.id, nome: i.nome, descricao: i.descricao, quantidade: i.quantidade, categoria: i.categoria }); }}><Pencil size={16} /></button>
                    <button className="rounded p-1.5 text-red-600 hover:bg-red-50" aria-label={`Excluir ${i.nome}`} onClick={() => { setErro(""); setExcluir(i); }}><Trash2 size={16} /></button>
                  </>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {itens.length === 0 && <Vazio>Nenhum item no estoque. Use “Novo item” ou importe um arquivo JSON.</Vazio>}
      </div>

      <Modal titulo={`${mov?.tipo ?? ""} · ${mov?.item.nome ?? ""} ${mov?.item.descricao ?? ""}`} aberto={!!mov} fechar={() => setMov(null)}>
        <form onSubmit={movimentar} className="space-y-3">
          <p className="text-sm text-slate-500">Saldo atual: <b>{mov?.item.quantidade}</b></p>
          <Campo rotulo="Quantidade"><input className="input" type="number" min={1} required value={qtd} onChange={(e) => setQtd(Number(e.target.value))} /></Campo>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setMov(null)}>Cancelar</button><button className="btn-primary" disabled={ocupado}>Registrar {mov?.tipo === "Entrada" ? "entrada" : "saída"}</button></div>
        </form>
      </Modal>

      <Modal titulo={form?.id ? "Editar item" : "Novo item"} aberto={!!form} fechar={() => setForm(null)}>
        {form && <form onSubmit={salvar} className="space-y-3">
          <Campo rotulo="Item"><input className="input" required value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Tinta Preta" /></Campo>
          <Campo rotulo="Descrição"><input className="input" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Ex.: 544" /></Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo rotulo="Categoria"><select className="input" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value as "Tinta" | "Toner" })}><option>Tinta</option><option>Toner</option></select></Campo>
            <Campo rotulo="Quantidade"><input className="input" type="number" min={0} required value={form.quantidade} onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })} /></Campo>
          </div>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button><button className="btn-primary" disabled={ocupado}>Salvar</button></div>
        </form>}
      </Modal>

      <Modal titulo="Excluir item" aberto={!!excluir} fechar={() => setExcluir(null)}>
        <p className="mb-4 text-sm">Excluir <b>{excluir?.nome} {excluir?.descricao}</b> ({excluir?.quantidade} un.)? Essa ação não pode ser desfeita.</p>
        {erro && <Aviso>{erro}</Aviso>}
        <div className="mt-3 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setExcluir(null)}>Cancelar</button><button className="btn-danger" disabled={ocupado} onClick={confirmarExcluir}>Excluir item</button></div>
      </Modal>
    </div>
  );
}
