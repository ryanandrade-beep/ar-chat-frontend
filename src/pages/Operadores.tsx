import { useState } from 'react';
import { KeyRound, Plus, UserCheck, UserX } from 'lucide-react';
import { api, dataHora } from '../api';
import type { Operador } from '../tipos';
import { Aviso, Campo, Modal, Topo, iniciais, useCarregar } from '../components/ui';
import { CampoSenha } from '../components/Campos';

export function Operadores() {
  const todos = useCarregar(() => api<Operador[]>('/operators'));
  // o perfil de atendente do dono aparece para atribuir conversas, mas não é gerenciado aqui
  const operadores = { ...todos, dados: todos.dados?.filter((o) => !o.owner) ?? null };
  const [novo, setNovo] = useState(false);
  const [senhaDe, setSenhaDe] = useState<Operador | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const ativos = operadores.dados?.filter((o) => o.active).length ?? 0;

  const alternar = async (o: Operador) => {
    setErro(null);
    try {
      await api(`/operators/${o.id}`, { metodo: 'PUT', corpo: { name: o.name, active: !o.active } });
      setOk(`${o.name} ${o.active ? 'desativado: não consegue mais entrar' : 'reativado'}.`);
      todos.recarregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };

  return (
    <>
      <Topo titulo="Operadores" subtitulo={`Cada operador entra com o próprio e-mail e senha e atende as conversas da workspace. ${ativos} ativo(s).`}>
        <button className="botao primario" onClick={() => setNovo(true)}><Plus size={16} /> Novo operador</button>
      </Topo>
      <div className="pagina">
        <Aviso tipo="ok">{ok}</Aviso>
        <Aviso>{erro ?? operadores.erro}</Aviso>
        <div className="cartao tabela-rolagem">
          <table className="tabela">
            <thead><tr><th>Operador</th><th>Login (e-mail)</th><th>Desde</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {operadores.dados?.map((o) => (
                <tr key={o.id}>
                  <td><span style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{iniciais(o.name)}</span>{o.name}</span></td>
                  <td>{o.email}</td>
                  <td>{dataHora(o.createdAt)}</td>
                  <td>{o.active ? <span className="selo verde">Ativo</span> : <span className="selo">Desativado</span>}</td>
                  <td>
                    <div className="acoes" style={{ justifyContent: 'flex-end' }}>
                      <button className="botao pequeno" onClick={() => setSenhaDe(o)}><KeyRound size={15} /> Nova senha</button>
                      <button className="botao pequeno" onClick={() => alternar(o)}>
                        {o.active ? <><UserX size={15} /> Desativar</> : <><UserCheck size={15} /> Reativar</>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {operadores.dados?.length === 0 && <div className="vazio">Nenhum operador ainda. Cadastre a sua equipe de atendimento.</div>}
        </div>
      </div>
      {novo && <NovoOperador aoFechar={() => setNovo(false)} aoSalvar={(n) => { setNovo(false); setOk(`${n} cadastrado. Envie o e-mail e a senha para ele entrar.`); todos.recarregar(); }} />}
      {senhaDe && <NovaSenha operador={senhaDe} aoFechar={() => setSenhaDe(null)} aoSalvar={() => { setOk(`Senha de ${senhaDe.name} redefinida.`); setSenhaDe(null); }} />}
    </>
  );
}

function NovoOperador({ aoFechar, aoSalvar }: { aoFechar: () => void; aoSalvar: (nome: string) => void }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const salvar = async () => {
    setErro(null);
    try {
      await api('/operators', { corpo: { name: nome, email, password: senha } });
      aoSalvar(nome);
    } catch (e) {
      setErro((e as Error).message);
    }
  };
  return (
    <Modal titulo="Novo operador" aoFechar={aoFechar}>
      <div className="formulario">
        <Campo rotulo="Nome"><input className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
        <Campo rotulo="E-mail (login)" dica="Único na plataforma: não pode ser o mesmo de outro login."><input className="entrada" type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} /></Campo>
        <Campo rotulo="Senha inicial" dica="Mínimo de 8 caracteres, com letras e números."><CampoSenha valor={senha} aoMudar={setSenha} autoComplete="new-password" /></Campo>
        <Aviso>{erro}</Aviso>
        <div className="acoes" style={{ justifyContent: 'flex-end' }}>
          <button className="botao" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario" onClick={salvar} disabled={!nome || !email || !senha}>Cadastrar</button>
        </div>
      </div>
    </Modal>
  );
}

function NovaSenha({ operador, aoFechar, aoSalvar }: { operador: Operador; aoFechar: () => void; aoSalvar: () => void }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const salvar = async () => {
    setErro(null);
    try {
      await api(`/operators/${operador.id}/password`, { metodo: 'PUT', corpo: { password: senha } });
      aoSalvar();
    } catch (e) {
      setErro((e as Error).message);
    }
  };
  return (
    <Modal titulo={`Nova senha · ${operador.name}`} aoFechar={aoFechar}>
      <div className="formulario">
        <CampoSenha valor={senha} aoMudar={setSenha} autoComplete="new-password" />
        <Aviso>{erro}</Aviso>
        <div className="acoes" style={{ justifyContent: 'flex-end' }}>
          <button className="botao" onClick={aoFechar}>Cancelar</button>
          <button className="botao primario" onClick={salvar} disabled={!senha}>Salvar</button>
        </div>
      </div>
    </Modal>
  );
}
