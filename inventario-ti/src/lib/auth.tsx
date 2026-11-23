import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { Config, Perfil } from "./tipos";

type Ctx = {
  carregando: boolean; sessao: Session | null; perfil: Perfil | null; config: Config;
  admin: boolean; podeEditar: boolean; podeImportar: boolean; podeLogs: boolean;
  recarregar: () => Promise<void>; sair: () => Promise<void>;
};
const AuthCtx = createContext<Ctx>(null as unknown as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [sessao, setSessao] = useState<Session | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [config, setConfig] = useState<Config>({});

  const carregarDados = useCallback(async (s: Session | null) => {
    if (!s) { setPerfil(null); setConfig({}); return; }
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("perfis").select("*").eq("id", s.user.id).maybeSingle(),
      supabase.from("configuracoes").select("chave, valor"),
    ]);
    setPerfil((p as Perfil) ?? null);
    setConfig(Object.fromEntries((c ?? []).map((x: { chave: string; valor: unknown }) => [x.chave, x.valor])));
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => { setSessao(data.session); await carregarDados(data.session); setCarregando(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => { setSessao(s); setTimeout(() => carregarDados(s), 0); });
    return () => sub.subscription.unsubscribe();
  }, [carregarDados]);

  const ativo = !!perfil?.ativo;
  const admin = ativo && perfil?.perfil === "admin";
  const ligado = (k: string) => config[k] !== false;
  const value: Ctx = {
    carregando, sessao, perfil, config, admin,
    podeEditar: admin || (ativo && !!perfil?.editar_estoque && ligado("editar_estoque")),
    podeImportar: admin || (ativo && !!perfil?.importar_json && ligado("importar_json")),
    podeLogs: admin || (ativo && !!perfil?.ver_logs && ligado("logs_visiveis")),
    recarregar: async () => carregarDados(sessao),
    sair: async () => { await supabase.auth.signOut(); },
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
