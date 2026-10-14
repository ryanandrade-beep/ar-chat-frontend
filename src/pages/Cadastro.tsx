import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Mail, User } from 'lucide-react';
import { useSessao } from '../sessao';
import { Aviso, Campo } from '../components/ui';
import { CampoIcone, CampoSenha } from '../components/Campos';
import { digitos, documentoValido, mascaraCnpj, mascaraCpf, mascaraTelefone } from '../mascaras';
import { Marca } from './Login';

const forca = (s: string) => [s.length >= 8, /[A-Za-z]/.test(s), /\d/.test(s), /[^A-Za-z0-9]/.test(s) || s.length >= 12].filter(Boolean).length;

export function Cadastro() {
  const { cadastrar } = useSessao();
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [tipo, setTipo] = useState<'CPF' | 'CNPJ'>('CNPJ');
  const [documento, setDocumento] = useState('');
  const [origem, setOrigem] = useState('');
  const [termos, setTermos] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const nivel = forca(senha);

  const avancar = (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (digitos(telefone).length < 10) return setErro('Informe o WhatsApp com DDD');
    if (nivel < 3 || senha.length < 8) return setErro('A senha deve ter no mínimo 8 caracteres, com letras e números');
    if (senha !== confirmacao) return setErro('As senhas não conferem');
    setEtapa(2);
  };

  const criar = async (e: FormEvent) => {
    e.preventDefault();
    setErro(null);
    if (!documentoValido(documento, tipo)) return setErro(`${tipo} inválido`);
    setEnviando(true);
    try {
      await cadastrar({
        name: empresa || nome, email, phone: '55' + digitos(telefone), documentId: digitos(documento), documentType: tipo,
        password: senha, passwordConfirmation: confirmacao, acceptTerms: termos,
      });
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="auth">
      <section className="auth-form" style={{ maxWidth: 760 }}>
        <Marca />
        <div className="etapas">
          <span className={`etapa ${etapa === 1 ? 'ativa' : 'feita'}`}><b>{etapa > 1 ? '✓' : 1}</b> Seus dados</span>
          <span className="linha-etapa" />
          <span className={`etapa ${etapa === 2 ? 'ativa' : ''}`}><b>2</b> Sua empresa</span>
          <span className="linha-etapa" />
          <span className="etapa"><b>3</b> Começar a atender</span>
        </div>
        {etapa === 1 ? (
          <form className="formulario" onSubmit={avancar}>
            <div>
              <h1 className="auth-titulo">Seus dados</h1>
              <p className="auth-sub">Seu e-mail e seu WhatsApp ficam guardados para recuperar o acesso no futuro.</p>
            </div>
            <Campo rotulo="Nome completo"><CampoIcone icone={<User size={17} />} value={nome} onChange={(e) => setNome(e.target.value)} required placeholder="Seu nome completo" autoComplete="name" /></Campo>
            <Campo rotulo="Email"><CampoIcone icone={<Mail size={17} />} type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} required placeholder="seu@email.com" autoComplete="email" /></Campo>
            <Campo rotulo="WhatsApp">
              <div className="prefixo-telefone">
                <span>🇧🇷 +55</span>
                <input className="entrada" value={telefone} onChange={(e) => setTelefone(mascaraTelefone(e.target.value))} required inputMode="numeric"
                       placeholder="(44) 99999-0000" autoComplete="tel-national" />
              </div>
            </Campo>
            <div className="linha-form">
              <Campo rotulo="Senha">
                <CampoSenha valor={senha} aoMudar={setSenha} autoComplete="new-password" />
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4].map((n) => <span key={n} style={{ flex: 1, height: 4, borderRadius: 4, background: n <= nivel ? (nivel >= 3 ? 'var(--marca)' : 'var(--alerta)') : 'var(--linha)' }} />)}
                </div>
                <small style={{ color: 'var(--tinta-3)' }}>Mínimo de 8 caracteres, com letras e números</small>
              </Campo>
              <Campo rotulo="Confirmar senha">
                <CampoSenha valor={confirmacao} aoMudar={setConfirmacao} autoComplete="new-password" />
                {confirmacao && confirmacao !== senha && <small style={{ color: 'var(--erro)' }}>As senhas não conferem</small>}
              </Campo>
            </div>
            <Aviso>{erro}</Aviso>
            <button className="botao primario pilula">Continuar <ArrowRight size={17} /></button>
            <p className="links-auth">Já tem conta? <Link to="/entrar"><strong>Entrar</strong></Link></p>
          </form>
        ) : (
          <form className="formulario" onSubmit={criar}>
            <div>
              <h1 className="auth-titulo">Sua empresa</h1>
              <p className="auth-sub">Esta é a sua workspace: depois você cadastra os operadores, cada um com login próprio.</p>
            </div>
            <Campo rotulo="Nome da empresa"><CampoIcone icone={<Building2 size={17} />} value={empresa} onChange={(e) => setEmpresa(e.target.value)} required placeholder="Supermercado Exemplo" autoComplete="organization" /></Campo>
            <div className="linha-form" style={{ gridTemplateColumns: '120px 1fr' }}>
              <Campo rotulo="Documento">
                <select className="entrada" style={{ height: 46, borderRadius: 12, background: '#fff' }} value={tipo}
                        onChange={(e) => { setTipo(e.target.value as 'CPF' | 'CNPJ'); setDocumento(''); }}>
                  <option>CNPJ</option><option>CPF</option>
                </select>
              </Campo>
              <Campo rotulo={tipo}>
                <CampoIcone icone={<Building2 size={17} />} value={documento} inputMode="numeric" required
                            placeholder={tipo === 'CNPJ' ? '00.000.000/0000-00' : '000.000.000-00'}
                            onChange={(e) => setDocumento(tipo === 'CNPJ' ? mascaraCnpj(e.target.value) : mascaraCpf(e.target.value))} />
                {digitos(documento).length === (tipo === 'CPF' ? 11 : 14) && !documentoValido(documento, tipo) &&
                  <small style={{ color: 'var(--erro)' }}>{tipo} inválido</small>}
              </Campo>
            </div>
            <Campo rotulo="Como conheceu o A&R Chat?">
              <select className="entrada" style={{ height: 46, borderRadius: 12, background: '#fff' }} value={origem} onChange={(e) => setOrigem(e.target.value)}>
                <option value="">Selecione uma opção</option><option>Indicação</option><option>Google</option>
                <option>Instagram</option><option>Evento</option><option>Outro</option>
              </select>
            </Campo>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} style={{ marginTop: 3 }} />
              <span>Aceito os <Link to="/termos" target="_blank">Termos de Uso</Link> e a <Link to="/termos#privacidade" target="_blank">Política de Privacidade</Link>.</span>
            </label>
            <Aviso>{erro}</Aviso>
            <div className="acoes">
              <button type="button" className="botao pilula" onClick={() => setEtapa(1)}><ArrowLeft size={17} /> Voltar</button>
              <button className="botao primario pilula" style={{ flex: 1 }} disabled={enviando || !termos}>
                {enviando ? 'Criando…' : <>Criar conta <ArrowRight size={17} /></>}
              </button>
            </div>
          </form>
        )}
      </section>
      <aside className="auth-lado">
        <span className="auth-etiqueta">CRIE SUA CONTA</span>
        <h2>Comece a atender em <em>menos de 5 minutos.</em></h2>
        <p style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}><CheckCircle2 size={18} color="#4fd1a1" /> Cobrança só por mensagem enviada</p>
        <p style={{ display: 'flex', gap: 8, alignItems: 'center', margin: 0 }}><CheckCircle2 size={18} color="#4fd1a1" /> Operadores ilimitados, cada um com login próprio</p>
      </aside>
    </div>
  );
}
