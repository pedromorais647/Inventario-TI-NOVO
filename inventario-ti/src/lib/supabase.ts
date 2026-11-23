import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://byueezfuivjdswpxoanb.supabase.co";
// Chave pública (publishable): pode ficar no front-end. O acesso real é controlado pelas regras (RLS) do banco.
const CHAVE_PUBLICA = "sb_publishable_VAnY2Yhq2XNxl_Al-_xFBg_vCOLPMpX";

export const supabase = createClient(SUPABASE_URL, CHAVE_PUBLICA);

export async function chamarFuncao<T = { ok: boolean }>(nome: string, corpo: unknown, comSessao = true): Promise<T> {
  const { data: s } = await supabase.auth.getSession();
  const headers: Record<string, string> = { "Content-Type": "application/json", apikey: CHAVE_PUBLICA };
  headers.Authorization = `Bearer ${comSessao ? s.session?.access_token ?? CHAVE_PUBLICA : CHAVE_PUBLICA}`;
  const r = await fetch(`${SUPABASE_URL}/functions/v1/${nome}`, { method: "POST", headers, body: JSON.stringify(corpo) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.erro || j.message || "Falha na operação");
  return j as T;
}
