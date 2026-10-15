import { useState } from 'react';
import { CheckCheck, Clock3, MessageCircleMore, MessagesSquare } from 'lucide-react';
import { api, duracao, hoje, inicioDoMes } from '../api';
import type { Operador } from '../tipos';
import { Aviso, Topo, useCarregar } from '../components/ui';
import { mascaraTelefone } from '../mascaras';

interface Painel {
  attendances: number; openNow: number; waitingNow: number; finished: number; averageFirstResponseSeconds: number | null;
  perDay: Record<string, number>; perOperator: { operatorId: string | null; name: string; attendances: number }[];
  topContacts: { name: string; phone: string; attendances: number }[];
}

const diaAntes = (dias: number) => { const d = new Date(); d.setDate(d.getDate() - dias); return d.toLocaleDateString('sv-SE'); };
const mesPassado = () => {
  const d = new Date(); const inicio = new Date(d.getFullYear(), d.getMonth() - 1, 1); const fim = new Date(d.getFullYear(), d.getMonth(), 0);
  return [inicio.toLocaleDateString('sv-SE'), fim.toLocaleDateString('sv-SE')];
};

export function Painel() {
  const operadores = useCarregar(() => api<Operador[]>('/operators'));
  const [operador, setOperador] = useState('');
  const [filtro, setFiltro] = useState<'dia' | 'semana' | 'mes' | 'passado' | 'outro'>('dia');
  const [de, setDe] = useState(hoje());
  const [ate, setAte] = useState(hoje());
  const periodo = filtro === 'dia' ? [hoje(), hoje()] : filtro === 'semana' ? [diaAntes(6), hoje()]
    : filtro === 'mes' ? [inicioDoMes(), hoje()] : filtro === 'passado' ? mesPassado() : [de, ate];
  const painel = useCarregar(() => api<Painel>(`/reports/dashboard?from=${periodo[0]}&to=${periodo[1]}${operador ? `&operatorId=${operador}` : ''}`),
    [periodo[0], periodo[1], operador]);
  const p = painel.dados;
  const dias = Object.entries(p?.perDay ?? {});
  const maximo = Math.max(1, ...dias.map(([, n]) => n));

  return (
    <>
      <Topo titulo="Dashboard" subtitulo="Como está o atendimento da sua equipe." />
      <div className="pagina">
        <div className="cartao cartao-corpo" style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'end' }}>
          <div className="campo" style={{ minWidth: 220 }}>
            <label>Filtre por um operador</label>
            <select className="entrada" value={operador} onChange={(e) => setOperador(e.target.value)}>
              <option value="">Todos</option>
              {operadores.dados?.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div className="campo">
            <label>Período</label>
            <div className="abas">
              {([['dia', 'Hoje'], ['semana', '7 dias'], ['mes', 'Mês'], ['passado', 'Mês passado'], ['outro', 'Outro']] as const).map(([v, n]) => (
                <button key={v} className={`aba${filtro === v ? ' ativa' : ''}`} onClick={() => setFiltro(v)}>{n}</button>
              ))}
            </div>
          </div>
          {filtro === 'outro' && (
            <div className="acoes">
              <input className="entrada" type="date" value={de} onChange={(e) => setDe(e.target.value)} style={{ width: 160 }} aria-label="De" />
              <input className="entrada" type="date" value={ate} onChange={(e) => setAte(e.target.value)} style={{ width: 160 }} aria-label="Até" />
            </div>
          )}
        </div>
        <Aviso>{painel.erro}</Aviso>
        {p && (
          <>
            <div className="grade">
              <Card titulo="Atendimentos no período" valor={p.attendances} icone={<MessagesSquare color="var(--marca)" />} />
              <Card titulo="Atendimentos abertos" valor={p.openNow} icone={<MessageCircleMore color="var(--alerta)" />} detalhe={`${p.waitingNow} aguardando ser atendido`} />
              <Card titulo="Finalizados" valor={p.finished} icone={<CheckCheck color="var(--info)" />} />
              <Card titulo="Tempo médio de primeira resposta" valor={duracao(p.averageFirstResponseSeconds)} icone={<Clock3 color="var(--marca-escura)" />} />
            </div>
            <div className="grade" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'start' }}>
              <div className="cartao">
                <div className="cartao-topo"><h2>Atendimentos por dia</h2></div>
                <div className="cartao-corpo" style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 220 }}>
                  {dias.length === 0 && <div className="vazio" style={{ width: '100%' }}>Não há dados para mostrar.</div>}
                  {dias.map(([dia, n]) => (
                    <div key={dia} title={`${dia}: ${n}`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                      <small>{n}</small>
                      <div style={{ width: '100%', maxWidth: 36, height: `${(n / maximo) * 150}px`, background: 'var(--marca)', borderRadius: 6 }} />
                      <small style={{ color: 'var(--tinta-3)' }}>{dia.slice(8)}/{dia.slice(5, 7)}</small>
                    </div>
                  ))}
                </div>
              </div>
              <div className="cartao">
                <div className="cartao-topo"><h2>Por operador</h2></div>
                <table className="tabela"><tbody>
                  {p.perOperator.map((o) => <tr key={o.operatorId ?? 'nenhum'}><td>{o.name}</td><td style={{ textAlign: 'right' }}><strong>{o.attendances}</strong></td></tr>)}
                </tbody></table>
                {p.perOperator.length === 0 && <div className="vazio">Não há dados para mostrar.</div>}
              </div>
              <div className="cartao">
                <div className="cartao-topo"><h2>Top 10 · contatos que mais geram atendimento</h2></div>
                <table className="tabela"><tbody>
                  {p.topContacts.map((c, i) => (
                    <tr key={i}><td>{i + 1}. {c.name}<br /><small style={{ color: 'var(--tinta-3)' }}>{c.phone.length > 11 ? `+${c.phone.slice(0, 2)} ${mascaraTelefone(c.phone.slice(2))}` : c.phone}</small></td>
                      <td style={{ textAlign: 'right' }}><strong>{c.attendances}</strong></td></tr>
                  ))}
                </tbody></table>
                {p.topContacts.length === 0 && <div className="vazio">Não há dados para mostrar.</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Card({ titulo, valor, icone, detalhe }: { titulo: string; valor: React.ReactNode; icone: React.ReactNode; detalhe?: string }) {
  return (
    <div className="cartao indicador" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <span>{titulo}</span>
        <strong>{valor}</strong>
        {detalhe && <small style={{ color: 'var(--tinta-3)' }}>{detalhe}</small>}
      </div>
      {icone}
    </div>
  );
}
