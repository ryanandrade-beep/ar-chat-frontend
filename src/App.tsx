import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProvedorSessao, useSessao } from './sessao';
import { Topo } from './components/ui';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { EsqueciSenha } from './pages/EsqueciSenha';
import { Termos } from './pages/Termos';
import { Painel } from './pages/Painel';
import { MinhaConta } from './pages/MinhaConta';
import { Contatos } from './pages/Contatos';
import { Operadores } from './pages/Operadores';
import { Departamentos } from './pages/Departamentos';

function Inicio() {
  const { sessao } = useSessao();
  return (
    <>
      <Topo titulo={`Olá, ${sessao?.nome}`} subtitulo={sessao?.workspace} />
      <section className="pagina">
        <div className="cartao">
          <div className="cartao-corpo">Em construção.</div>
        </div>
      </section>
    </>
  );
}

function Rotas() {
  const { sessao } = useSessao();
  const inicio = sessao?.perfil === 'admin' ? '/admin/minha-conta' : sessao?.perfil === 'client' ? '/dashboard' : '/contatos';

  if (!sessao) {
    return (
      <Routes>
        <Route path="/entrar" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/termos" element={<Termos />} />
        <Route path="*" element={<Navigate to="/entrar" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/termos" element={<Termos />} />
      <Route element={<Layout />}>
        <Route path="/inicio" element={<Inicio />} />
        {sessao.perfil !== 'admin' && <Route path="/contatos" element={<Contatos />} />}
        {sessao.perfil === 'client' && (
          <>
            <Route path="/dashboard" element={<Painel />} />
            <Route path="/operadores" element={<Operadores />} />
            <Route path="/departamentos" element={<Departamentos />} />
          </>
        )}
        {sessao.perfil === 'admin' && <Route path="/admin/minha-conta" element={<MinhaConta />} />}
      </Route>
      <Route path="*" element={<Navigate to={inicio} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ProvedorSessao>
      <BrowserRouter>
        <Rotas />
      </BrowserRouter>
    </ProvedorSessao>
  );
}
