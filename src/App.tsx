import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ProvedorSessao } from './sessao';
import { Topo } from './components/ui';

const menu = ['Atendimento', 'Contatos', 'Campanhas', 'Relatórios'];

function Inicio() {
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
        <Topo titulo="Atendimento" subtitulo="Conversas com os clientes pelo WhatsApp" />
        <section className="pagina">
          <div className="cartao">
            <div className="cartao-corpo">Em construção.</div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ProvedorSessao>
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Inicio />} />
        </Routes>
      </BrowserRouter>
    </ProvedorSessao>
  );
}
