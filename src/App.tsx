import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ProvedorSessao, useSessao } from './sessao';
import { Topo } from './components/ui';
import { Login } from './pages/Login';
import { Cadastro } from './pages/Cadastro';
import { EsqueciSenha } from './pages/EsqueciSenha';
import { Termos } from './pages/Termos';

const menu = ['Atendimento', 'Contatos', 'Campanhas', 'Relatórios'];

function Inicio() {
  const { sessao, sair } = useSessao();
  return (
    <div className="app">
      <aside className="menu">
        <div className="marca">
          <span className="marca-icone">A&R</span>
          A&R Chat
        </div>
        {menu.map((item, i) => (
          <a key={item} href="#" className={`menu-item${i === 0 ? ' ativo' : ''}`}>{item}</a>
        ))}
      </aside>
      <main className="conteudo">
        <Topo titulo={`Olá, ${sessao?.nome}`} subtitulo={sessao?.workspace}>
          <button className="botao" onClick={sair}>Sair</button>
        </Topo>
        <section className="pagina">
          <div className="cartao">
            <div className="cartao-corpo">Em construção.</div>
          </div>
        </section>
      </main>
    </div>
  );
}

function Rotas() {
  const { sessao } = useSessao();

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
      <Route path="*" element={<Inicio />} />
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
