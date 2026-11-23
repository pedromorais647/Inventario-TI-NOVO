import { useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Aviso } from "../components/Ui";

const ITENS = [
  { chave: "editar_estoque", rotulo: "Edição de equipamentos e estoque", ajuda: "Desligado: só administradores alteram dados." },
  { chave: "importar_json", rotulo: "Importação de arquivo JSON", ajuda: "Desligado: só administradores importam." },
  { chave: "logs_visiveis", rotulo: "Histórico visível", ajuda: "Desligado: só administradores veem o histórico." },
];

export default function Configuracoes() {
  const { config, recarregar } = useAuth();
  const [erro, setErro] = useState("");
  async function alternar(chave: string, valor: boolean) {
    setErro("");
    const { error } = await supabase.from("configuracoes").update({ valor, atualizado_em: new Date().toISOString() }).eq("chave", chave);
    if (error) return setErro(error.message);
    await recarregar();
  }
  return (
    <div className="max-w-2xl space-y-4">
      <div><h1 className="text-2xl font-extrabold text-folha-900">Configurações</h1><p className="text-sm text-slate-500">Liga ou desliga recursos para todos os usuários que não são administradores.</p></div>
      {erro && <Aviso>{erro}</Aviso>}
      <div className="card divide-y divide-slate-100">
        {ITENS.map((i) => {
          const ligado = config[i.chave] !== false;
          return (
            <label key={i.chave} className="flex cursor-pointer items-center justify-between gap-4 p-4">
              <span><span className="block font-semibold">{i.rotulo}</span><span className="text-sm text-slate-500">{i.ajuda}</span></span>
              <input type="checkbox" role="switch" className="h-5 w-5 accent-folha-600" checked={ligado} onChange={(e) => alternar(i.chave, e.target.checked)} />
            </label>
          );
        })}
      </div>
    </div>
  );
}
