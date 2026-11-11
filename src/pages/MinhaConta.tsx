import { useEffect, useState } from 'react';
import { api } from '../api';
import { Aviso, Campo, Topo, useCarregar } from '../components/ui';
import { CampoSenha } from '../components/Campos';
import { digitos, mascaraTelefone } from '../mascaras';

interface Admin { id: string; name: string; login: string; email: string | null; phone: string | null }

/** Backoffice: dados do administrador logado e troca de senha. */
export function MinhaConta() {
  const conta = useCarregar(() => api<Admin>('/admins/me'));
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [atual, setAtual] = useState('');
  const [nova, setNova] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [msg, setMsg] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  useEffect(() => {
    if (!conta.dados) return;
    setNome(conta.dados.name);
    setEmail(conta.dados.email ?? '');
    const tel = conta.dados.phone ?? '';
    setTelefone(mascaraTelefone(tel.startsWith('55') && tel.length > 11 ? tel.slice(2) : tel));
  }, [conta.dados]);

  const executar = async (acao: () => Promise<unknown>, sucesso: string) => {
    setMsg(null);
    try {
      await acao();
      setMsg({ tipo: 'ok', texto: sucesso });
    } catch (e) {
      setMsg({ tipo: 'erro', texto: (e as Error).message });
    }
  };

  return (
    <>
      <Topo titulo="Minha conta" subtitulo="Seus dados de acesso ao backoffice da plataforma." />
      <div className="pagina">
        {msg && <Aviso tipo={msg.tipo}>{msg.texto}</Aviso>}
        <div className="grade" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'start' }}>
          <div className="cartao">
            <div className="cartao-topo"><h2>Dados da conta</h2><span className="selo">login: {conta.dados?.login}</span></div>
            <div className="cartao-corpo formulario">
              <Campo rotulo="Nome"><input className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
              <Campo rotulo="E-mail" dica="Usado para contato e recuperação de acesso."><input className="entrada" type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} /></Campo>
              <Campo rotulo="Telefone (WhatsApp)">
                <div className="prefixo-telefone"><span>+55</span><input className="entrada" style={{ height: 40 }} value={telefone} inputMode="numeric"
                       onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} placeholder="(44) 99999-0000" /></div>
              </Campo>
              <button className="botao primario" onClick={() => executar(() => api('/admins/me', {
                metodo: 'PUT', corpo: { name: nome, email: email || null, phone: telefone ? '55' + digitos(telefone) : null },
              }).then(conta.recarregar), 'Dados atualizados.')}>Salvar dados</button>
            </div>
          </div>
          <div className="cartao">
            <div className="cartao-topo"><h2>Trocar senha</h2></div>
            <div className="cartao-corpo formulario">
              <Campo rotulo="Senha atual"><CampoSenha valor={atual} aoMudar={setAtual} /></Campo>
              <Campo rotulo="Nova senha" dica="Mínimo de 8 caracteres."><CampoSenha valor={nova} aoMudar={setNova} autoComplete="new-password" /></Campo>
              <Campo rotulo="Confirmar nova senha"><CampoSenha valor={confirmacao} aoMudar={setConfirmacao} autoComplete="new-password" /></Campo>
              <button className="botao primario" disabled={!atual || !nova} onClick={() => executar(async () => {
                await api('/admins/me/password', { metodo: 'PUT', corpo: { currentPassword: atual, newPassword: nova, passwordConfirmation: confirmacao } });
                setAtual(''); setNova(''); setConfirmacao('');
              }, 'Senha alterada.')}>Trocar senha</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
