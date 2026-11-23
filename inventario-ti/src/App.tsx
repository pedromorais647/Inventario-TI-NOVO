import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./lib/auth";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import { AguardandoAtivacao, TrocarSenha } from "./pages/Contas";
import Painel from "./pages/Painel";
import Equipamentos from "./pages/Equipamentos";
import Estoque from "./pages/Estoque";
import Historico from "./pages/Historico";
import Usuarios from "./pages/Usuarios";
import Configuracoes from "./pages/Configuracoes";

export default function App() {
  const { carregando, sessao, perfil, admin, podeLogs } = useAuth();
  if (carregando) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Carregando…</div>;
  if (!sessao) return <Login />;
  if (!perfil) return <div className="grid min-h-screen place-items-center text-sm text-slate-500">Carregando perfil…</div>;
  if (sessao.user.user_metadata?.trocar_senha) return <TrocarSenha />;
  if (!perfil.ativo) return <AguardandoAtivacao />;
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Painel />} />
        <Route path="equipamentos" element={<Equipamentos />} />
        <Route path="estoque" element={<Estoque />} />
        <Route path="historico" element={podeLogs ? <Historico /> : <Navigate to="/" />} />
        <Route path="usuarios" element={admin ? <Usuarios /> : <Navigate to="/" />} />
        <Route path="configuracoes" element={admin ? <Configuracoes /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Route>
    </Routes>
  );
}
