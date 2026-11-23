export type Perfil = {
  id: string; email: string; nome: string | null; perfil: "admin" | "usuario"; ativo: boolean;
  editar_estoque: boolean; importar_json: boolean; ver_logs: boolean; criado_em: string;
};
export type Equipamento = {
  id: number; nome: string; tipo: string | null; setor: string | null; status: string | null; anydesk: string | null;
  ultima_manutencao: string | null; ultima_atualizacao: string | null;
  categoria: "Computador" | "Notebook" | "Impressora" | "Outro";
  ultima_preventiva: string | null; ultima_tinta: string | null; ultimo_toner: string | null;
};
export type ItemEstoque = {
  id: number; nome: string; descricao: string; quantidade: number; categoria: "Tinta" | "Toner";
  atualizado_em: string | null; ultima_acao: string | null;
};
export type LogEstoque = {
  id: number; nome: string; descricao: string | null; quantidade: number | null; tipo: string;
  detalhes: string | null; usuario: string | null; criado_em: string;
};
export type LogEquip = {
  id: number; equipamento_nome: string; acao: string; detalhes: string | null; usuario: string | null; criado_em: string;
};
export type Config = Record<string, unknown>;
