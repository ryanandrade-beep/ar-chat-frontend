import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookUser, MessageSquarePlus, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { api } from '../api';
import type { Destinatario } from '../tipos';
import { Aviso, Campo, Modal, Topo, iniciais, useCarregar } from '../components/ui';
import { digitos, mascaraTelefone } from '../mascaras';

type Edicao = Partial<Destinatario> & { type: 'contact' | 'group' };

export function Contatos() {
  const contatos = useCarregar(() => api<Destinatario[]>('/recipients'));
  const [edicao, setEdicao] = useState<Edicao | null>(null);
  const [conversaCom, setConversaCom] = useState<Destinatario | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  const [importar, setImportar] = useState(false);
  const [ok, setOk] = useState<string | null>(null);

  const excluir = async (d: Destinatario) => {
    if (!confirm(`Excluir ${d.name}?`)) return;
    setErro(null);
    try {
      await api(`/recipients/${d.id}`, { metodo: 'DELETE' });
      contatos.recarregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  const lista = (contatos.dados ?? []).filter((d) => `${d.name} ${d.phone}`.toLowerCase().includes(filtro.toLowerCase()));

  return (
    <>
      <Topo titulo="Contatos e grupos" subtitulo="Destinatários das respostas e das campanhas.">
        <button className="botao" onClick={() => setImportar(true)}><BookUser size={16} /> Importar da agenda</button>
        <button className="botao" onClick={() => setEdicao({ type: 'group', acceptsMarketing: false })}><Users size={16} /> Novo grupo</button>
        <button className="botao primario" onClick={() => setEdicao({ type: 'contact', acceptsMarketing: true })}><Plus size={16} /> Novo contato</button>
      </Topo>
      <div className="pagina">
        <Aviso tipo="ok">{ok}</Aviso>
        <Aviso>{erro ?? contatos.erro}</Aviso>
        <div className="cartao">
          <div className="cartao-topo">
            <h2>{contatos.dados?.length ?? 0} destinatário(s)</h2>
            <input className="entrada" style={{ maxWidth: 280 }} placeholder="Buscar" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
          </div>
          <div className="tabela-rolagem">
            <table className="tabela">
              <thead><tr><th>Nome</th><th>Telefone / ID do grupo</th><th>Tipo</th><th>Aceita ofertas</th><th></th></tr></thead>
              <tbody>
                {lista.map((d) => (
                  <tr key={d.id}>
                    <td><span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{d.type === 'group' ? <Users size={15} /> : iniciais(d.name)}</span>{d.name}</span></td>
                    <td>{d.phone}</td>
                    <td><span className="selo">{d.type === 'group' ? 'Grupo' : 'Contato'}</span></td>
                    <td>{d.acceptsMarketing ? <span className="selo verde">Sim</span> : <span className="selo">Não</span>}</td>
                    <td>
                      <div className="acoes" style={{ justifyContent: 'flex-end' }}>
                        <button className="botao pequeno" onClick={() => setConversaCom(d)}><MessageSquarePlus size={15} /> Mensagem</button>
                        <button className="botao icone pequeno" aria-label="Alterar" onClick={() => setEdicao({ ...d })}><Pencil size={15} /></button>
                        <button className="botao icone pequeno perigo" aria-label="Excluir" onClick={() => excluir(d)}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lista.length === 0 && !contatos.carregando && <div className="vazio">Nenhum destinatário.</div>}
          </div>
        </div>
      </div>
      {edicao && <EditarContato inicial={edicao} aoFechar={() => setEdicao(null)} aoSalvar={() => { setEdicao(null); contatos.recarregar(); }} />}
      {importar && <ImportarAgenda aoFechar={() => setImportar(false)} aoImportar={(m) => { setImportar(false); setOk(m); contatos.recarregar(); }} />}
      {conversaCom && <PrimeiraMensagem destinatario={conversaCom} aoFechar={() => setConversaCom(null)} />}
    </>
  );
}

function EditarContato({ inicial, aoFechar, aoSalvar }: { inicial: Edicao; aoFechar: () => void; aoSalvar: () => void }) {
  const [d, setD] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const grupo = d.type === 'group';

  const salvar = async () => {
    setErro(null);
    try {
      const corpo = { type: d.type, name: d.name, phone: d.phone, acceptsMarketing: !!d.acceptsMarketing };
      await api(d.id ? `/recipients/${d.id}` : '/recipients', { metodo: d.id ? 'PUT' : 'POST', corpo });
      aoSalvar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  return (
    <Modal titulo={`${d.id ? 'Alterar' : 'Novo'} ${grupo ? 'grupo' : 'contato'}`} aoFechar={aoFechar}>
      <div className="formulario">
        <Campo rotulo="Nome"><input className="entrada" value={d.name ?? ''} onChange={(e) => setD({ ...d, name: e.target.value })} /></Campo>
        <Campo rotulo={grupo ? 'ID do grupo' : 'Telefone com DDD'} dica={grupo ? 'Ex.: 120363019502650977-group (veja em Canal > Grupos)' : 'Ex.: 5544999990000'}>
          <input className="entrada" value={d.phone ?? ''} inputMode={grupo ? 'text' : 'numeric'}
                 onChange={(e) => setD({ ...d, phone: grupo ? e.target.value.replace(/[^\d-]/g, '') : digitos(e.target.value).slice(0, 13) })} />
        </Campo>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={!!d.acceptsMarketing} onChange={(e) => setD({ ...d, acceptsMarketing: e.target.checked })} />
          Aceita receber ofertas (consentimento LGPD)
        </label>
        <Aviso>{erro}</Aviso>
        <div className="acoes" style={{ justifyContent: 'flex-end' }}>
          <button className="botao" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario" onClick={salvar}>Salvar</button>
        </div>
      </div>
    </Modal>
  );
}

function PrimeiraMensagem({ destinatario, aoFechar }: { destinatario: Destinatario; aoFechar: () => void }) {
  const navegar = useNavigate();
  const [texto, setTexto] = useState('');
  const [prioridade, setPrioridade] = useState('normal');
  const [erro, setErro] = useState<string | null>(null);

  const enviar = async () => {
    setErro(null);
    try {
      await api('/messages', { corpo: { recipientId: destinatario.id, content: texto, priority: prioridade } });
      navegar('/atendimento');
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  return (
    <Modal titulo={`Mensagem para ${destinatario.name}`} aoFechar={aoFechar}>
      <div className="formulario">
        <textarea className="entrada" value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Digite a mensagem" />
        <select className="entrada" value={prioridade} onChange={(e) => setPrioridade(e.target.value)}>
          <option value="normal">Normal · R$ 0,25</option><option value="urgent">Urgente · R$ 0,50</option>
        </select>
        <Aviso>{erro}</Aviso>
        <div className="acoes" style={{ justifyContent: 'flex-end' }}>
          <button className="botao" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario" onClick={enviar} disabled={!texto.trim()}>Enviar</button>
        </div>
      </div>
    </Modal>
  );
}

interface ContatoAgenda { phone: string; name: string; alreadySaved: boolean }

/** Lista os contatos salvos no celular conectado e importa os escolhidos (sem consentimento para ofertas). */
function ImportarAgenda({ aoFechar, aoImportar }: { aoFechar: () => void; aoImportar: (mensagem: string) => void }) {
  const agenda = useCarregar(() => api<ContatoAgenda[]>('/recipients/whatsapp-contacts?page=1&size=200'));
  const [escolhidos, setEscolhidos] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const novos = (agenda.dados ?? []).filter((c) => !c.alreadySaved);
  const lista = (agenda.dados ?? []).filter((c) => `${c.name} ${c.phone}`.toLowerCase().includes(busca.toLowerCase()));

  const alternar = (telefone: string) => {
    const proximo = new Set(escolhidos);
    if (proximo.has(telefone)) proximo.delete(telefone); else proximo.add(telefone);
    setEscolhidos(proximo);
  };

  const importar = async () => {
    setErro(null);
    setEnviando(true);
    try {
      const contacts = (agenda.dados ?? []).filter((c) => escolhidos.has(c.phone)).map((c) => ({ phone: c.phone, name: c.name }));
      const r = await api<{ imported: number; skipped: number }>('/recipients/import', { corpo: { contacts } });
      aoImportar(`${r.imported} contato(s) importado(s)${r.skipped ? `, ${r.skipped} já existiam` : ''}. Marque quem aceitou receber ofertas antes de enviar campanhas.`);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Modal titulo="Importar contatos da agenda do WhatsApp" aoFechar={aoFechar}>
      <div className="formulario">
        <p style={{ margin: 0, color: 'var(--tinta-3)' }}>Contatos salvos no celular conectado. Os importados entram sem consentimento para ofertas (LGPD).</p>
        <Aviso>{erro ?? agenda.erro}</Aviso>
        <div className="acoes">
          <input className="entrada" style={{ flex: 1 }} placeholder="Buscar" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <button className="botao pequeno" onClick={() => setEscolhidos(new Set(novos.map((c) => c.phone)))}>Selecionar novos ({novos.length})</button>
        </div>
        <div className="cartao" style={{ boxShadow: 'none', maxHeight: 320, overflow: 'auto' }}>
          {agenda.carregando && <div className="vazio">Buscando contatos…</div>}
          {lista.map((c) => (
            <label key={c.phone} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', borderBottom: '1px solid var(--linha)', opacity: c.alreadySaved ? .55 : 1 }}>
              <input type="checkbox" disabled={c.alreadySaved} checked={escolhidos.has(c.phone)} onChange={() => alternar(c.phone)} />
              <span style={{ flex: 1 }}>{c.name}<br /><small style={{ color: 'var(--tinta-3)' }}>+{c.phone.slice(0, 2)} {mascaraTelefone(c.phone.slice(2))}</small></span>
              {c.alreadySaved && <span className="selo">Já cadastrado</span>}
            </label>
          ))}
          {!agenda.carregando && (agenda.dados ?? []).length === 0 && !agenda.erro && <div className="vazio">Nenhum contato na agenda do número conectado.</div>}
        </div>
        <div className="acoes" style={{ justifyContent: 'flex-end' }}>
          <button className="botao" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario" onClick={importar} disabled={enviando || escolhidos.size === 0}>Importar {escolhidos.size || ''}</button>
        </div>
      </div>
    </Modal>
  );
}
