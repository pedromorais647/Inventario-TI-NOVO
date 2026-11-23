import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Logos } from "../components/Logos";
import { Aviso, Campo } from "../components/Ui";

export function AguardandoAtivacao() {
  const { sair, perfil } = useAuth();
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <div className="card w-full max-w-sm space-y-4 p-6 text-center">
        <div className="flex justify-center"><Logos /></div>
        <h1 className="text-lg font-bold">Acesso desativado</h1>
        <p className="text-sm text-slate-600">A conta {perfil?.email} ainda não está ativa. Peça ao administrador para liberar o acesso.</p>
        <button className="btn-ghost w-full" onClick={sair}>Sair</button>
      </div>
    </div>
  );
}

export function TrocarSenha() {
  const { sair, recarregar } = useAuth();
  const [senha, setSenha] = useState(""); const [conf, setConf] = useState(""); const [erro, setErro] = useState(""); const [ocupado, setOcupado] = useState(false);
  async function salvar(e: FormEvent) {
    e.preventDefault(); setErro("");
    if (senha.length < 8) return setErro("A senha precisa ter pelo menos 8 caracteres.");
    if (senha !== conf) return setErro("As senhas não são iguais.");
    setOcupado(true);
    const { error } = await supabase.auth.updateUser({ password: senha, data: { trocar_senha: false } });
    setOcupado(false);
    if (error) return setErro(error.message);
    await supabase.auth.refreshSession(); await recarregar();
  }
  return (
    <div className="grid min-h-screen place-items-center p-4">
      <form onSubmit={salvar} className="card w-full max-w-sm space-y-3 p-6">
        <div className="flex justify-center"><Logos /></div>
        <h1 className="text-center text-lg font-bold">Defina a sua senha</h1>
        <p className="text-center text-sm text-slate-500">Você entrou com uma senha temporária. Escolha uma senha só sua.</p>
        <Campo rotulo="Nova senha"><input className="input" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" /></Campo>
        <Campo rotulo="Repita a nova senha"><input className="input" type="password" value={conf} onChange={(e) => setConf(e.target.value)} autoComplete="new-password" /></Campo>
        {erro && <Aviso>{erro}</Aviso>}
        <button className="btn-primary w-full" disabled={ocupado}>Salvar senha</button>
        <button type="button" className="w-full text-center text-xs text-slate-500 underline" onClick={sair}>Sair</button>
      </form>
    </div>
  );
}
