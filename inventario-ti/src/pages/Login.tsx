import { useEffect, useState, type FormEvent } from "react";
import { supabase, chamarFuncao } from "../lib/supabase";
import { Logos } from "../components/Logos";
import { Aviso, Campo } from "../components/Ui";

export default function Login() {
  const [temAdmin, setTemAdmin] = useState<boolean | null>(null);
  const [modo, setModo] = useState<"entrar" | "primeiro">("entrar");
  const [email, setEmail] = useState(""); const [senha, setSenha] = useState(""); const [nome, setNome] = useState("");
  const [erro, setErro] = useState(""); const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    supabase.rpc("tem_admin").then(({ data }) => { setTemAdmin(!!data); if (data === false) setModo("primeiro"); });
  }, []);

  async function enviar(e: FormEvent) {
    e.preventDefault(); setErro(""); setOcupado(true);
    try {
      if (modo === "primeiro") await chamarFuncao("primeiro-acesso", { email, senha, nome }, false);
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw new Error(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
    } catch (x) { setErro((x as Error).message); } finally { setOcupado(false); }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-folha-50 via-papel to-laranja-100 p-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-5 flex justify-center"><Logos altura="h-12" /></div>
        <h1 className="text-center text-xl font-extrabold text-folha-900">Inventário de TI</h1>
        <p className="mb-5 mt-1 text-center text-sm text-slate-500">
          {modo === "primeiro" ? "Crie a conta do administrador para começar." : "Entre com o seu e-mail e senha."}
        </p>
        <form onSubmit={enviar} className="space-y-3">
          {modo === "primeiro" && <Campo rotulo="Nome"><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" /></Campo>}
          <Campo rotulo="E-mail"><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></Campo>
          <Campo rotulo={modo === "primeiro" ? "Senha (mínimo 8 caracteres)" : "Senha"}>
            <input className="input" type="password" required minLength={modo === "primeiro" ? 8 : 1} value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete={modo === "primeiro" ? "new-password" : "current-password"} />
          </Campo>
          {erro && <Aviso>{erro}</Aviso>}
          <button className="btn-primary w-full" disabled={ocupado}>{ocupado ? "Aguarde…" : modo === "primeiro" ? "Criar administrador" : "Entrar"}</button>
        </form>
        {temAdmin === false && modo === "entrar" && <button className="mt-3 w-full text-center text-xs text-folha-700 underline" onClick={() => setModo("primeiro")}>Primeiro acesso</button>}
        <p className="mt-4 text-center text-xs text-slate-400">Novos usuários são criados pelo administrador.</p>
      </div>
    </div>
  );
}
