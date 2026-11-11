import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { StatusAtendimento, StatusMensagem } from '../tipos';

/** Carrega dados da API e expõe o estado de carregamento, o erro e uma função para recarregar. */
export function useCarregar<T>(buscar: () => Promise<T>, dependencias: unknown[] = []) {
  const [dados, setDados] = useState<T | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recarregar = useCallback(async () => {
    try {
      setDados(await buscar());
      setErro(null);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }, dependencias);
  useEffect(() => { recarregar(); }, [recarregar]);
  return { dados, erro, carregando, recarregar, setDados };
}

export function Topo({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children?: ReactNode }) {
  return (
    <header className="topo">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p>{subtitulo}</p>}
      </div>
      {children && <div className="acoes">{children}</div>}
    </header>
  );
}

export function Aviso({ tipo = 'erro', children }: { tipo?: 'erro' | 'ok' | 'info'; children: ReactNode }) {
  if (!children) return null;
  return <div className={`aviso ${tipo}`} role={tipo === 'erro' ? 'alert' : 'status'}>{children}</div>;
}

export function Modal({ titulo, aoFechar, children }: { titulo: string; aoFechar: () => void; children: ReactNode }) {
  return (
    <div className="modal-fundo" onMouseDown={(e) => e.target === e.currentTarget && aoFechar()}>
      <div className="cartao modal" role="dialog" aria-label={titulo}>
        <div className="cartao-topo">
          <h2>{titulo}</h2>
          <button className="botao icone pequeno" onClick={aoFechar} aria-label="Fechar"><X size={16} /></button>
        </div>
        <div className="cartao-corpo">{children}</div>
      </div>
    </div>
  );
}

export function Campo({ rotulo, dica, children }: { rotulo: string; dica?: string; children: ReactNode }) {
  return (
    <div className="campo">
      <label>{rotulo}</label>
      {children}
      {dica && <small>{dica}</small>}
    </div>
  );
}

export function Indicador({ rotulo, valor }: { rotulo: string; valor: ReactNode }) {
  return (
    <div className="cartao indicador">
      <span>{rotulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

export const NOMES_ATENDIMENTO: Record<StatusAtendimento, string> = {
  waiting: 'Aguardando', in_progress: 'Em andamento', on_hold: 'Em espera', finished: 'Finalizado',
};

const CORES_ATENDIMENTO: Record<StatusAtendimento, string> = {
  waiting: 'amarelo', in_progress: 'marca', on_hold: 'azul', finished: '',
};

export function SeloAtendimento({ status }: { status: StatusAtendimento }) {
  return <span className={`selo ${CORES_ATENDIMENTO[status]}`}>{NOMES_ATENDIMENTO[status]}</span>;
}

export const NOMES_MENSAGEM: Record<StatusMensagem, string> = {
  queued: 'Na fila', processing: 'Enviando', sent: 'Enviada', delivered: 'Entregue', read: 'Lida', failed: 'Falhou',
};

export function SeloMensagem({ status }: { status: StatusMensagem }) {
  const cor = status === 'failed' ? 'vermelho' : status === 'read' ? 'azul' : status === 'delivered' || status === 'sent' ? 'verde' : 'amarelo';
  return <span className={`selo ${cor}`}>{NOMES_MENSAGEM[status]}</span>;
}

export const iniciais = (nome: string) =>
  nome.replace(/[^\p{L}\s]/gu, ' ').split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
