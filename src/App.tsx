const menu = ['Atendimento', 'Contatos', 'Campanhas', 'Relatórios'];

export default function App() {
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
        <header className="topo">
          <div>
            <h1>Atendimento</h1>
            <p>Conversas com os clientes pelo WhatsApp</p>
          </div>
        </header>
        <section className="pagina">
          <div className="cartao">
            <div className="cartao-corpo">Em construção.</div>
          </div>
        </section>
      </main>
    </div>
  );
}
