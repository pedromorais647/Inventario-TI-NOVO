import { NavLink, Outlet } from "react-router-dom";
import { Droplets, History, LayoutDashboard, LogOut, Monitor, Settings, Users } from "lucide-react";
import { useAuth } from "../lib/auth";
import { Logos } from "./Logos";

export default function Layout() {
  const { perfil, admin, podeLogs, sair } = useAuth();
  const itens = [
    { para: "/", rotulo: "Painel", icone: LayoutDashboard, mostrar: true, fim: true },
    { para: "/equipamentos", rotulo: "Equipamentos", icone: Monitor, mostrar: true },
    { para: "/estoque", rotulo: "Estoque de tintas", icone: Droplets, mostrar: true },
    { para: "/historico", rotulo: "Histórico", icone: History, mostrar: podeLogs },
    { para: "/usuarios", rotulo: "Usuários", icone: Users, mostrar: admin },
    { para: "/configuracoes", rotulo: "Configurações", icone: Settings, mostrar: admin },
  ].filter((i) => i.mostrar);

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5">
          <Logos />
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs leading-tight sm:block">
              <div className="font-semibold text-slate-800">{perfil?.nome || perfil?.email}</div>
              <div className="text-slate-500">{admin ? "Administrador" : "Usuário"}</div>
            </div>
            <button className="btn-ghost" onClick={sair}><LogOut size={16} /> Sair</button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Principal">
          {itens.map(({ para, rotulo, icone: I, fim }) => (
            <NavLink key={para} to={para} end={fim}
              className={({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? "bg-folha-600 text-white" : "text-slate-600 hover:bg-folha-50"}`}>
              <I size={16} /> {rotulo}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6"><Outlet /></main>
    </div>
  );
}
