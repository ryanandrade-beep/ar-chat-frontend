import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, definirAoExpirar, gravarSessao, lerSessao, type Sessao } from './api';
import type { Cliente } from './tipos';

interface ContextoSessao {
  sessao: Sessao | null;
  entrarComoCliente: (documento: string, tipo: 'CPF' | 'CNPJ') => Promise<void>;
  entrarComEmail: (email: string, senha: string) => Promise<void>;
  cadastrar: (dados: Cadastro) => Promise<void>;
  entrarComoAdmin: (login: string, senha: string) => Promise<void>;
  sair: () => void;
}

export interface Cadastro {
  name: string; email: string; phone: string; documentId: string; documentType: 'CPF' | 'CNPJ';
  password: string; passwordConfirmation: string; acceptTerms: boolean;
}

const Contexto = createContext<ContextoSessao | null>(null);

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao);

  const trocar = useCallback((nova: Sessao | null) => {
    gravarSessao(nova);
    setSessao(nova);
  }, []);

  useEffect(() => definirAoExpirar(() => trocar(null)), [trocar]);

  const abrir = (r: { token: string; client: Cliente; role?: string; userName?: string; operatorId?: string | null }) =>
    trocar({
      token: r.token, perfil: r.role === 'operator' ? 'operator' : 'client', nome: r.userName ?? r.client.name,
      clienteId: r.client.id, workspace: r.client.name, operadorId: r.operatorId ?? undefined,
    });

  const entrarComoCliente = async (documento: string, tipo: 'CPF' | 'CNPJ') => {
    abrir(await api<{ token: string; client: Cliente }>('/auth', { corpo: { documentId: documento, documentType: tipo } }));
  };

  const entrarComEmail = async (email: string, senha: string) =>
    abrir(await api<{ token: string; client: Cliente; role: string; userName: string; operatorId: string | null }>('/auth/login', { corpo: { email, password: senha } }));

  const cadastrar = async (dados: Cadastro) =>
    abrir(await api<{ token: string; client: Cliente }>('/auth/register', { corpo: dados }));

  const entrarComoAdmin = async (login: string, senha: string) => {
    const r = await api<{ token: string }>('/admin/auth', { corpo: { login, password: senha } });
    trocar({ token: r.token, perfil: 'admin', nome: login });
  };

  return (
    <Contexto.Provider value={{ sessao, entrarComoCliente, entrarComEmail, cadastrar, entrarComoAdmin, sair: () => trocar(null) }}>
      {children}
    </Contexto.Provider>
  );
}

export function useSessao() {
  const contexto = useContext(Contexto);
  if (!contexto) throw new Error('useSessao fora do ProvedorSessao');
  return contexto;
}
