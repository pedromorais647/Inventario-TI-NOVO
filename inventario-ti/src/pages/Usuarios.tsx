import { useCallback, useEffect, useState, type FormEvent } from "react";
import { KeyRound, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase, chamarFuncao } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import type { Perfil } from "../lib/tipos";
import { Aviso, Campo, Modal } from "../components/Ui";

type Form = { id?: string; email: string; nome: string; senha: string; perfil: "admin" | "usuario"; ativo: boolean; editar_estoque: boolean; importar_json: boolean; ver_logs: boolean };
const NOVO: Form = { email: "", nome: "", senha: "", perfil: "usuario", ativo: true, editar_estoque: false, importar_json: false, ver_logs: false };

export default function Usuarios() {
  const { sessao } = useAuth();
  const [lista, setLista] = useState<Perfil[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [senhaDe, setSenhaDe] = useState<Perfil | null>(null); const [nova, setNova] = useState("");
  const [excluir, setExcluir] = useState<Perfil | null>(null);
  const [erro, setErro] = useState(""); const [ok, setOk] = useState(""); const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    const { data } = await supabase.from("perfis").select("*").order("criado_em");
    setLista((data as Perfil[]) ?? []);
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  async function executar(fn: () => Promise<unknown>, depois: () => void, msg: string) {
    setErro(""); setOk(""); setOcupado(true);
    try { await fn(); depois(); setOk(msg); await carregar(); } catch (x) { setErro((x as Error).message); } finally { setOcupado(false); }
  }
  function salvar(e: FormEvent) {
    e.preventDefault(); if (!form) return;
    const { id, senha, ...resto } = form;
    executar(() => id ? chamarFuncao("admin-usuarios", { acao: "atualizar", id, ...resto }) : chamarFuncao("admin-usuarios", { acao: "criar", senha, ...resto }),
      () => setForm(null), id ? "Usuário atualizado." : "Usuário criado. Passe a senha temporária a ele; no primeiro acesso ele define a própria.");
  }
  const marcar = (k: "editar_estoque" | "importar_json" | "ver_logs", rotulo: string) => form && (
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-folha-600" disabled={form.perfil === "admin"} checked={form.perfil === "admin" || form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.checked })} />{rotulo}</label>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-extrabold text-folha-900">Usuários</h1><p className="text-sm text-slate-500">Quem acessa o sistema e o que cada um pode fazer.</p></div>
        <button className="btn-primary" onClick={() => { setErro(""); setOk(""); setForm(NOVO); }}><Plus size={16} /> Novo usuário</button>
      </div>
      {ok && <Aviso tipo="ok">{ok}</Aviso>}
      {erro && !form && !senhaDe && !excluir && <Aviso>{erro}</Aviso>}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="border-b border-slate-200 bg-slate-50"><tr>{["Nome", "E-mail", "Perfil", "Acesso", "Permissões", ""].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {lista.map((u) => (
              <tr key={u.id}>
                <td className="td font-semibold">{u.nome}</td><td className="td">{u.email}</td>
                <td className="td">{u.perfil === "admin" ? "Administrador" : "Usuário"}</td>
                <td className="td"><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${u.ativo ? "bg-folha-100 text-folha-800" : "bg-slate-200 text-slate-600"}`}>{u.ativo ? "Ativo" : "Desativado"}</span></td>
                <td className="td text-xs text-slate-600">{u.perfil === "admin" ? "Todas" : [u.editar_estoque && "Editar", u.importar_json && "Importar", u.ver_logs && "Histórico"].filter(Boolean).join(", ") || "Somente consulta"}</td>
                <td className="td whitespace-nowrap text-right">
                  <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100" aria-label={`Editar ${u.email}`} onClick={() => { setErro(""); setOk(""); setForm({ id: u.id, email: u.email, nome: u.nome ?? "", senha: "", perfil: u.perfil, ativo: u.ativo, editar_estoque: u.editar_estoque, importar_json: u.importar_json, ver_logs: u.ver_logs }); }}><Pencil size={16} /></button>
                  <button className="rounded p-1.5 text-slate-500 hover:bg-slate-100" aria-label={`Redefinir senha de ${u.email}`} onClick={() => { setErro(""); setOk(""); setNova(""); setSenhaDe(u); }}><KeyRound size={16} /></button>
                  {u.id !== sessao?.user.id && <button className="rounded p-1.5 text-red-600 hover:bg-red-50" aria-label={`Excluir ${u.email}`} onClick={() => { setErro(""); setOk(""); setExcluir(u); }}><Trash2 size={16} /></button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal titulo={form?.id ? "Editar usuário" : "Novo usuário"} aberto={!!form} fechar={() => setForm(null)}>
        {form && <form onSubmit={salvar} className="space-y-3">
          <Campo rotulo="Nome"><input className="input" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></Campo>
          <Campo rotulo="E-mail"><input className="input" type="email" required disabled={!!form.id} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Campo>
          {!form.id && <Campo rotulo="Senha temporária (mínimo 8 caracteres)"><input className="input" type="text" required minLength={8} value={form.senha} onChange={(e) => setForm({ ...form, senha: e.target.value })} autoComplete="off" /></Campo>}
          <Campo rotulo="Perfil"><select className="input" value={form.perfil} onChange={(e) => setForm({ ...form, perfil: e.target.value as "admin" | "usuario" })}><option value="usuario">Usuário</option><option value="admin">Administrador</option></select></Campo>
          <div className="space-y-2 rounded-lg bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-500">Permissões</p>
            {marcar("editar_estoque", "Editar equipamentos e estoque")}{marcar("importar_json", "Importar arquivo JSON")}{marcar("ver_logs", "Ver histórico")}
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-folha-600" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />Acesso ativo</label>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setForm(null)}>Cancelar</button><button className="btn-primary" disabled={ocupado}>Salvar</button></div>
        </form>}
      </Modal>

      <Modal titulo={`Redefinir senha · ${senhaDe?.email ?? ""}`} aberto={!!senhaDe} fechar={() => setSenhaDe(null)}>
        <form onSubmit={(e) => { e.preventDefault(); executar(() => chamarFuncao("admin-usuarios", { acao: "atualizar", id: senhaDe!.id, senha: nova }), () => setSenhaDe(null), "Senha temporária definida. No próximo acesso o usuário escolhe uma nova."); }} className="space-y-3">
          <Campo rotulo="Nova senha temporária (mínimo 8 caracteres)"><input className="input" type="text" required minLength={8} value={nova} onChange={(e) => setNova(e.target.value)} autoComplete="off" /></Campo>
          {erro && <Aviso>{erro}</Aviso>}
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setSenhaDe(null)}>Cancelar</button><button className="btn-primary" disabled={ocupado}>Definir senha</button></div>
        </form>
      </Modal>

      <Modal titulo="Excluir usuário" aberto={!!excluir} fechar={() => setExcluir(null)}>
        <p className="mb-3 text-sm">Excluir a conta de <b>{excluir?.email}</b>? Ela deixa de existir. Para só bloquear o acesso, use “Acesso ativo” na edição.</p>
        {erro && <Aviso>{erro}</Aviso>}
        <div className="mt-3 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setExcluir(null)}>Cancelar</button><button className="btn-danger" disabled={ocupado} onClick={() => executar(() => chamarFuncao("admin-usuarios", { acao: "excluir", id: excluir!.id }), () => setExcluir(null), "Usuário excluído.")}>Excluir usuário</button></div>
      </Modal>
    </div>
  );
}
