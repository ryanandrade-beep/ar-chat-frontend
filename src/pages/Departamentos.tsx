import { useEffect, useState } from 'react';
import { Bot, Pencil, Plus } from 'lucide-react';
import { api } from '../api';
import type { Departamento } from '../tipos';
import { Aviso, Campo, Modal, Topo, useCarregar } from '../components/ui';

interface Ura { active: boolean; welcomeMessage: string; questionMessage: string; maxAttempts: number; defaultDepartmentId: string | null; ignoreGroups: boolean }

export function Departamentos() {
  const departamentos = useCarregar(() => api<Departamento[]>('/departments'));
  const [edicao, setEdicao] = useState<Partial<Departamento> | null>(null);
  const ativos = (departamentos.dados ?? []).filter((d) => d.active);
  return (
    <>
      <Topo titulo="Departamentos e URA" subtitulo="Setores de atendimento e o menu automático que encaminha o cliente final ao setor escolhido.">
        <button className="botao primario" onClick={() => setEdicao({ active: true })}><Plus size={16} /> Novo departamento</button>
      </Topo>
      <div className="pagina">
        <Aviso>{departamentos.erro}</Aviso>
        <div className="cartao tabela-rolagem">
          <div className="cartao-topo"><h2>Departamentos</h2><small style={{ color: 'var(--tinta-3)' }}>No menu da URA aparecem em ordem alfabética</small></div>
          <table className="tabela">
            <thead><tr><th>Opção</th><th>Departamento</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {(departamentos.dados ?? []).map((d) => (
                <tr key={d.id}>
                  <td>{d.active ? ativos.findIndex((a) => a.id === d.id) + 1 : '—'}</td>
                  <td>{d.name}</td>
                  <td>{d.active ? <span className="selo verde">Ativo</span> : <span className="selo">Inativo</span>}</td>
                  <td style={{ textAlign: 'right' }}><button className="botao pequeno" onClick={() => setEdicao(d)}><Pencil size={14} /> Editar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {departamentos.dados?.length === 0 && <div className="vazio">Nenhum departamento. Ex.: Açougue, Padaria, Entregas, Financeiro.</div>}
        </div>
        <ConfigUra departamentos={ativos} />
      </div>
      {edicao && <EditarDepartamento inicial={edicao} aoFechar={() => setEdicao(null)} aoSalvar={() => { setEdicao(null); departamentos.recarregar(); }} />}
    </>
  );
}

function EditarDepartamento({ inicial, aoFechar, aoSalvar }: { inicial: Partial<Departamento>; aoFechar: () => void; aoSalvar: () => void }) {
  const [d, setD] = useState(inicial);
  const [erro, setErro] = useState<string | null>(null);
  const salvar = async () => {
    setErro(null);
    try {
      await api(d.id ? `/departments/${d.id}` : '/departments', { metodo: d.id ? 'PUT' : 'POST', corpo: { name: d.name, active: d.active } });
      aoSalvar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };
  return (
    <Modal titulo={d.id ? 'Editar departamento' : 'Novo departamento'} aoFechar={aoFechar}>
      <div className="formulario">
        <Campo rotulo="Nome"><input className="entrada" value={d.name ?? ''} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Entregas" /></Campo>
        {d.id && <label style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={!!d.active} onChange={(e) => setD({ ...d, active: e.target.checked })} /> Ativo (aparece no menu da URA)</label>}
        <Aviso>{erro}</Aviso>
        <div className="acoes" style={{ justifyContent: 'flex-end' }}>
          <button className="botao" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario" onClick={salvar} disabled={!d.name}>Salvar</button>
        </div>
      </div>
    </Modal>
  );
}

function ConfigUra({ departamentos }: { departamentos: Departamento[] }) {
  const ura = useCarregar(() => api<Ura>('/ivr'));
  const [f, setF] = useState<Ura | null>(null);
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);
  useEffect(() => { if (ura.dados) setF(ura.dados); }, [ura.dados]);
  if (!f) return null;

  const salvar = async () => {
    setMsg(null);
    try {
      setF(await api<Ura>('/ivr', { metodo: 'PUT', corpo: f }));
      setMsg({ tipo: 'ok', texto: 'Configuração da URA salva.' });
    } catch (e) {
      setMsg({ tipo: 'erro', texto: (e as Error).message });
    }
  };
  const previa = [f.welcomeMessage.replace('{nome}', 'Maria'), [f.questionMessage, ...departamentos.map((d, i) => `${i + 1} - ${d.name}`)].join('\n')];

  return (
    <div className="cartao">
      <div className="cartao-topo">
        <h2 style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Bot size={18} /> URA · atendimento automático</h2>
        <label className={`selo ${f.active ? 'verde' : ''}`} style={{ cursor: 'pointer', gap: 6 }}>
          <input type="checkbox" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} /> {f.active ? 'Ativa' : 'Desligada'}
        </label>
      </div>
      <div className="cartao-corpo" style={{ display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="formulario">
          <p style={{ margin: 0, color: 'var(--tinta-3)' }}>Quando um cliente final inicia um atendimento, a URA envia as boas-vindas e o menu. Ele responde com o número (ou o nome) do departamento. Mensagens da URA não são cobradas.</p>
          <Campo rotulo="Mensagem de boas-vindas" dica="{nome} vira o nome do contato.">
            <textarea className="entrada" value={f.welcomeMessage} onChange={(e) => setF({ ...f, welcomeMessage: e.target.value })} />
          </Campo>
          <Campo rotulo="Mensagem de pergunta" dica="As opções numeradas são acrescentadas automaticamente.">
            <textarea className="entrada" value={f.questionMessage} onChange={(e) => setF({ ...f, questionMessage: e.target.value })} />
          </Campo>
          <div className="linha-form">
            <Campo rotulo="Respostas inválidas aceitas">
              <input className="entrada" type="number" min={1} max={10} value={f.maxAttempts} onChange={(e) => setF({ ...f, maxAttempts: Number(e.target.value) })} />
            </Campo>
            <Campo rotulo="Depois disso, encaminhar para">
              <select className="entrada" value={f.defaultDepartmentId ?? ''} onChange={(e) => setF({ ...f, defaultDepartmentId: e.target.value || null })}>
                <option value="">Sem departamento (fila geral)</option>
                {departamentos.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </Campo>
          </div>
          <label style={{ display: 'flex', gap: 8 }}><input type="checkbox" checked={f.ignoreGroups} onChange={(e) => setF({ ...f, ignoreGroups: e.target.checked })} /> Ignorar grupos (a URA só responde contatos)</label>
          {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
          <button className="botao primario" onClick={salvar} style={{ justifySelf: 'start' }}>Salvar configurações</button>
        </div>
        <div>
          <small style={{ color: 'var(--tinta-3)' }}>Prévia no WhatsApp</small>
          <div className="mensagens" style={{ background: 'var(--chat-fundo)', borderRadius: 12, padding: 14, marginTop: 6 }}>
            <div className="bolha">Boa tarde!</div>
            {previa.map((t, i) => <div key={i} className="bolha saida">{t}<div className="rodape"><span className="selo" style={{ padding: '0 6px' }}>URA</span></div></div>)}
            <div className="bolha">2</div>
          </div>
        </div>
      </div>
    </div>
  );
}
