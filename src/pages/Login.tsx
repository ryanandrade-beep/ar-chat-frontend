import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Mail, MessagesSquare, ShieldCheck, User } from 'lucide-react';
import { useSessao } from '../sessao';
import { Aviso, Campo } from '../components/ui';
import { CampoIcone, CampoSenha } from '../components/Campos';
import { digitos, documentoValido, mascaraCnpj, mascaraCpf } from '../mascaras';

export function Marca({ clara = false }: { clara?: boolean }) {
  return (
    <div className="marca" style={{ color: clara ? '#fff' : undefined }}>
      <span className="marca-icone"><MessagesSquare size={18} /></span>A&amp;R Chat
    </div>
  );
}

export function Login() {
  const { entrarComEmail, entrarComoAdmin, entrarComoCliente } = useSessao();
  const [modo, setModo] = useState<'conta' | 'documento' | 'admin'>('conta');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState<'CPF' | 'CNPJ'>('CNPJ');
  const [documento, setDocumento] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const entrar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (modo === 'documento' && !documentoValido(documento, tipo)) {
      setErro(`${tipo} inválido`);
      return;
    }
    setEnviando(true);
    try {
      if (modo === 'admin' || !email.includes('@')) await entrarComoAdmin(email, senha);
      else if (modo === 'documento') await entrarComoCliente(digitos(documento), tipo);
      else await entrarComEmail(email, senha);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth escura">
      <section className="auth-form">
        <Marca clara />
        <form className="auth-cartao" onSubmit={entrar}>
          <div>
            <h1 className="auth-titulo">{modo === 'admin' ? 'Backoffice' : 'Entre na sua conta'}</h1>
            <p className="auth-sub">{modo === 'admin' ? 'Acesso da administração da plataforma.' : 'Gerencie atendimentos, campanhas e sua equipe em tempo real.'}</p>
          </div>
          {modo === 'documento' ? (
            <div className="linha-form" style={{ gridTemplateColumns: '110px 1fr' }}>
              <Campo rotulo="Tipo">
                <select className="entrada" style={{ height: 46, borderRadius: 12 }} value={tipo}
                        onChange={(e) => { setTipo(e.target.value as 'CPF' | 'CNPJ'); setDocumento(''); }}>
                  <option>CNPJ</option><option>CPF</option>
                </select>
              </Campo>
              <Campo rotulo={tipo}>
                <CampoIcone icone={<Building2 size={17} />} value={documento} inputMode="numeric" required
                            placeholder={tipo === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                            onChange={(e) => setDocumento(tipo === 'CNPJ' ? mascaraCnpj(e.target.value) : mascaraCpf(e.target.value))} />
              </Campo>
            </div>
          ) : (
            <>
              <Campo rotulo={modo === 'admin' ? 'Login' : 'Email ou login'}>
                <CampoIcone icone={modo === 'admin' || (email && !email.includes('@')) ? <User size={17} /> : <Mail size={17} />} type="text"
                            value={email} onChange={(e) => setEmail(e.target.value.trim())} required autoCapitalize="none" spellCheck={false}
                            autoComplete="username" placeholder={modo === 'admin' ? 'seu login' : 'seu@email.com'} />
              </Campo>
              <Campo rotulo="Senha"><CampoSenha valor={senha} aoMudar={setSenha} /></Campo>
            </>
          )}
          <Aviso>{erro}</Aviso>
          <button className="botao primario pilula" disabled={enviando}>
            {enviando ? 'Entrando…' : <>Entrar na plataforma <ArrowRight size={17} /></>}
          </button>
          {modo === 'conta' && (
            <>
              <div className="links-auth">
                <Link to="/esqueci-senha">Esqueceu a senha?</Link> · <Link to="/cadastro"><strong>Criar conta da empresa</strong></Link>
              </div>
              <small style={{ textAlign: 'center', color: 'var(--tinta-3)' }}>Operador? Seu acesso é criado pelo administrador da sua empresa.</small>
            </>
          )}
          <div className="links-auth" style={{ borderTop: '1px solid var(--linha)', paddingTop: 14 }}>
            {modo !== 'conta' && <button type="button" className="botao pequeno" onClick={() => setModo('conta')}><Mail size={14} /> Entrar com e-mail</button>}
            {modo !== 'documento' && <button type="button" className="botao pequeno" onClick={() => setModo('documento')}><Building2 size={14} /> CPF/CNPJ (demonstração)</button>}
            {modo !== 'admin' && <button type="button" className="botao pequeno" onClick={() => setModo('admin')}><ShieldCheck size={14} /> Backoffice</button>}
          </div>
        </form>
        <small style={{ color: '#8fa69a' }}>A&amp;R CHAT · ATENDIMENTO E CAMPANHAS PELO WHATSAPP</small>
      </section>
      <aside className="auth-lado">
        <span className="traco" />
        <h2>Todo o atendimento da sua empresa no WhatsApp, <em>em um só lugar.</em></h2>
        <p style={{ maxWidth: 460, margin: 0 }}>Operadores com login próprio, conversas por status, campanhas com consentimento e cobrança por mensagem.</p>
      </aside>
    </div>
  );
}
