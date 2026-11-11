/** Cliente HTTP da API do A&R Chat: guarda a sessão e envia o token em todas as chamadas. */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

export type Perfil = 'client' | 'operator' | 'admin';

export interface Sessao {
  token: string;
  perfil: Perfil;
  nome: string;
  clienteId?: string;
  workspace?: string;
  operadorId?: string;
}

const CHAVE = 'archat.sessao';

export function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    return bruto ? (JSON.parse(bruto) as Sessao) : null;
  } catch {
    return null;
  }
}

export function gravarSessao(sessao: Sessao | null) {
  try {
    if (sessao) localStorage.setItem(CHAVE, JSON.stringify(sessao));
    else localStorage.removeItem(CHAVE);
  } catch {
    /* navegação privada: a sessão fica só na memória */
  }
}

export class ErroApi extends Error {
  status: number;
  campos?: Record<string, string>;

  constructor(status: number, mensagem: string, campos?: Record<string, string>) {
    super(mensagem);
    this.status = status;
    this.campos = campos;
  }
}

let aoExpirar: () => void = () => {};
export function definirAoExpirar(funcao: () => void) {
  aoExpirar = funcao;
}

export async function api<T>(caminho: string, opcoes: { metodo?: string; corpo?: unknown } = {}): Promise<T> {
  const sessao = lerSessao();
  const resposta = await fetch(API_URL + caminho, {
    method: opcoes.metodo ?? (opcoes.corpo === undefined ? 'GET' : 'POST'),
    headers: {
      ...(opcoes.corpo === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(sessao ? { Authorization: `Bearer ${sessao.token}` } : {}),
    },
    body: opcoes.corpo === undefined ? undefined : JSON.stringify(opcoes.corpo),
  });
  if (resposta.status === 401 && sessao) aoExpirar();
  if (resposta.status === 204) return undefined as T;
  const texto = await resposta.text();
  const dados = texto ? JSON.parse(texto) : undefined;
  if (!resposta.ok) {
    const campos = dados?.fields as Record<string, string> | undefined;
    const detalhe = campos ? ': ' + Object.entries(campos).map(([c, m]) => `${c} ${m}`).join('; ') : '';
    throw new ErroApi(resposta.status, (dados?.message ?? `Erro ${resposta.status}`) + detalhe, campos);
  }
  return dados as T;
}

export const reais = (valor?: number | null) =>
  (valor ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const dataHora = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : '—';

export const hora = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

export const duracao = (segundos?: number | null) => {
  if (segundos == null) return '—';
  if (segundos < 60) return `${segundos}s`;
  const m = Math.floor(segundos / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
};

export const hoje = () => new Date().toLocaleDateString('sv-SE');
export const inicioDoMes = () => hoje().slice(0, 8) + '01';
