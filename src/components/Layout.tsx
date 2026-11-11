import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bot, ContactRound, LayoutDashboard, LogOut, Menu, MessagesSquare, UserCog, Users, Wallet,
} from 'lucide-react';
import { api, dataHora, reais } from '../api';
import { useSessao } from '../sessao';
import type { Cliente } from '../tipos';
import { Aviso, Indicador, Modal, iniciais, useCarregar } from './ui';

function Item({ para, icone, children }: { para: string; icone: ReactNode; children: ReactNode }) {
  return (
    <NavLink to={para} className={({ isActive }) => `menu-item${isActive ? ' ativo' : ''}`}>
      {icone}
      <span>{children}</span>
    </NavLink>
  );
}

const NOMES_TRANSACAO: Record<string, string> = { credit: 'Crédito', debit: 'Mensagem enviada', refund: 'Estorno', limit_adjustment: 'Ajuste de limite', monthly_fee: 'Mensalidade do plano' };

interface Transacao { id: string; type: string; amount: number; balanceAfter: number; timestamp: string }

/** Saldo sempre visível no topo; ao clicar, abre o extrato. Atualiza a cada 15 s e após cada envio. */
function ChipSaldo() {
  const cliente = useCarregar(() => api<Cliente>('/clients/me'));
  const [aberto, setAberto] = useState(false);
  useEffect(() => {
    const id = setInterval(cliente.recarregar, 15000);
    const aoEnviar = () => cliente.recarregar();
    window.addEventListener('archat:saldo', aoEnviar);
    return () => { clearInterval(id); window.removeEventListener('archat:saldo', aoEnviar); };
  }, [cliente.recarregar]);
  const c = cliente.dados;
  if (!c) return null;
  const prepago = c.planType === 'prepaid';
  return (
    <>
      <button className={`chip-saldo${c.available < 1 ? ' baixo' : ''}`} onClick={() => setAberto(true)} title="Ver saldo e extrato">
        <Wallet size={16} /> {prepago ? 'Saldo' : 'Limite disponível'} {reais(c.available)}
      </button>
      {aberto && <ModalSaldo cliente={c} aoFechar={() => setAberto(false)} />}
    </>
  );
}

function ModalSaldo({ cliente, aoFechar }: { cliente: Cliente; aoFechar: () => void }) {
  const extrato = useCarregar(() => api<Transacao[]>('/clients/me/transactions?limit=30'));
  const prepago = cliente.planType === 'prepaid';
  return (
    <Modal titulo="Saldo e extrato" aoFechar={aoFechar}>
      <div className="formulario">
        <div className="grade" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <Indicador rotulo={prepago ? 'Saldo disponível' : 'Limite disponível'} valor={reais(cliente.available)} />
          <Indicador rotulo={prepago ? 'Plano' : `Consumo de ${reais(cliente.limit)}`} valor={prepago ? 'Pré-pago' : reais(cliente.monthlyUsage)} />
        </div>
        <p style={{ margin: 0, color: 'var(--tinta-3)' }}>O preço de cada mensagem segue o seu plano. Para adicionar créditos, fale com o suporte da plataforma.</p>
        <Aviso>{extrato.erro}</Aviso>
        <div className="cartao" style={{ boxShadow: 'none', maxHeight: 320, overflow: 'auto' }}>
          <table className="tabela">
            <thead><tr><th>Data</th><th>Movimento</th><th style={{ textAlign: 'right' }}>Valor</th><th style={{ textAlign: 'right' }}>Saldo após</th></tr></thead>
            <tbody>
              {extrato.dados?.map((t) => (
                <tr key={t.id}>
                  <td>{dataHora(t.timestamp)}</td>
                  <td>{NOMES_TRANSACAO[t.type] ?? t.type}</td>
                  <td style={{ textAlign: 'right', color: ['debit', 'monthly_fee'].includes(t.type) ? 'var(--erro)' : 'var(--sucesso)' }}>
                    {['debit', 'monthly_fee'].includes(t.type) ? '−' : '+'} {reais(t.amount)}
                  </td>
                  <td style={{ textAlign: 'right' }}>{reais(t.balanceAfter)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {extrato.dados?.length === 0 && <div className="vazio">Sem movimentações nos últimos 90 dias.</div>}
        </div>
      </div>
    </Modal>
  );
}

function MenuUsuario() {
  const { sessao, sair } = useSessao();
  const navegar = useNavigate();
  const [aberto, setAberto] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fechar = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setAberto(false); };
    document.addEventListener('mousedown', fechar);
    return () => document.removeEventListener('mousedown', fechar);
  }, []);
  const papel = sessao?.perfil === 'admin' ? 'Backoffice' : sessao?.perfil === 'operator' ? 'Operador' : 'Responsável';
  return (
    <div ref={ref}>
      <button className="chip-usuario" onClick={() => setAberto(!aberto)}>
        <span className="avatar">{iniciais(sessao?.nome ?? '')}</span>
        <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
          <strong style={{ display: 'block', fontSize: 13 }}>{sessao?.nome}</strong>
          <small style={{ color: 'var(--tinta-3)' }}>{papel}{sessao?.workspace && sessao.perfil === 'operator' ? ` · ${sessao.workspace}` : ''}</small>
        </span>
      </button>
      {aberto && (
        <div className="menu-flutuante">
          {sessao?.perfil === 'admin' && <button onClick={() => { setAberto(false); navegar('/admin/minha-conta'); }}><UserCog size={16} /> Minha conta</button>}
          <button onClick={sair}><LogOut size={16} /> Sair</button>
        </div>
      )}
    </div>
  );
}

export function Layout() {
  const { sessao } = useSessao();
  const perfil = sessao?.perfil;
  const [menuAberto, setMenuAberto] = useState(false);
  const local = useLocation();
  useEffect(() => setMenuAberto(false), [local.pathname]);
  return (
    <div className="app">
      <nav className={`menu${menuAberto ? ' aberto' : ''}`} aria-label="Menu principal" onClick={(e) => { if (e.target === e.currentTarget) setMenuAberto(false); }}>
        <div className="marca">
          <span className="marca-icone"><MessagesSquare size={18} /></span>
          A&amp;R Chat
        </div>
        {perfil !== 'admin' && (
          <>
            <div className="menu-secao">Atendimento</div>
            <Item para="/contatos" icone={<ContactRound size={18} />}>Contatos e grupos</Item>
          </>
        )}
        {perfil === 'client' && (
          <>
            <div className="menu-secao">Gestão</div>
            <Item para="/dashboard" icone={<LayoutDashboard size={18} />}>Dashboard</Item>
            <Item para="/operadores" icone={<Users size={18} />}>Operadores</Item>
            <Item para="/departamentos" icone={<Bot size={18} />}>Departamentos e URA</Item>
          </>
        )}
        <div className="menu-rodape">
          <strong>{perfil === 'admin' ? 'Backoffice da plataforma' : sessao?.workspace}</strong>
          <span>{perfil === 'admin' ? 'Todas as workspaces' : 'Workspace'}</span>
        </div>
      </nav>
      <main className="conteudo">
        <div className="barra">
          <button className="botao-redondo botao-menu" onClick={() => setMenuAberto(true)} aria-label="Abrir menu"><Menu size={20} /></button>
          {perfil === 'client' && <ChipSaldo />}
          <MenuUsuario />
        </div>
        <Outlet />
      </main>
    </div>
  );
}
