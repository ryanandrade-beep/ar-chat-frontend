import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Info, Mail, MessageCircle } from 'lucide-react';
import { api } from '../api';
import { Aviso, Campo } from '../components/ui';
import { CampoIcone, CampoSenha } from '../components/Campos';
import { Marca } from './Login';

export function EsqueciSenha() {
  const navegar = useNavigate();
  const [etapa, setEtapa] = useState<'email' | 'codigo' | 'pronto'>('email');
  const [canal, setCanal] = useState<'email' | 'whatsapp'>('email');
  const [email, setEmail] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  const executar = async (acao: () => Promise<void>) => {
    setErro(null);
    setEnviando(true);
    try { await acao(); } catch (e) { setErro((e as Error).message); } finally { setEnviando(false); }
  };

  const pedir = (e?: FormEvent) => {
    e?.preventDefault();
    executar(async () => {
      await api('/auth/forgot-password', { corpo: { email, channel: canal } });
      setEtapa('codigo');
    });
  };

  const redefinir = (e: FormEvent) => {
    e.preventDefault();
    executar(async () => {
      await api('/auth/reset-password', { corpo: { email, code: codigo, password: senha, passwordConfirmation: confirmacao } });
      setEtapa('pronto');
    });
  };

  return (
    <div className="auth">
      <section className="auth-form" style={{ maxWidth: 620 }}>
        <Marca />
        <div>
          <h1 className="auth-titulo" style={{ fontSize: 36 }}>{etapa === 'pronto' ? 'Senha alterada!' : 'Esqueceu sua senha?'}</h1>
          <p className="auth-sub">
            {etapa === 'email' && 'Sem problema. Informe seu e-mail e escolha onde quer receber o código.'}
            {etapa === 'codigo' && `Se ${email} tiver conta, enviamos um código de 6 dígitos ${canal === 'whatsapp' ? 'para o WhatsApp do cadastro' : 'para o seu e-mail'}.`}
            {etapa === 'pronto' && 'Agora é só entrar com a nova senha.'}
          </p>
        </div>
        {etapa === 'email' && (
          <form className="formulario" onSubmit={pedir}>
            <Campo rotulo="Email cadastrado"><CampoIcone icone={<Mail size={17} />} type="email" value={email} onChange={(e) => setEmail(e.target.value.trim())} required placeholder="seu@email.com" autoComplete="email" /></Campo>
            <Campo rotulo="Receber o código por">
              <div className="opcoes-canal">
                <button type="button" className={`opcao-canal${canal === 'email' ? ' ativa' : ''}`} onClick={() => setCanal('email')}><Mail size={18} /> E-mail</button>
                <button type="button" className={`opcao-canal${canal === 'whatsapp' ? ' ativa' : ''}`} onClick={() => setCanal('whatsapp')}><MessageCircle size={18} /> WhatsApp do cadastro</button>
              </div>
            </Campo>
            <Aviso>{erro}</Aviso>
            <button className="botao primario pilula" disabled={enviando}>Enviar código <ArrowRight size={17} /></button>
            <div className="aviso info" style={{ display: 'flex', gap: 8 }}><Info size={16} style={{ flex: 'none', marginTop: 2 }} />
              <span><b>Dica:</b> o código vale por 15 minutos e só pode ser usado uma vez. Se não chegar pelo WhatsApp, ele é enviado por e-mail.</span></div>
          </form>
        )}
        {etapa === 'codigo' && (
          <form className="formulario" onSubmit={redefinir}>
            <Campo rotulo="Código de 6 dígitos">
              <input className="entrada" value={codigo} onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))} required inputMode="numeric"
                     autoComplete="one-time-code" style={{ letterSpacing: '.5em', fontSize: 20, height: 52, textAlign: 'center', borderRadius: 12, background: '#fff' }} />
            </Campo>
            <Campo rotulo="Nova senha"><CampoSenha valor={senha} aoMudar={setSenha} autoComplete="new-password" /></Campo>
            <Campo rotulo="Confirmar nova senha"><CampoSenha valor={confirmacao} aoMudar={setConfirmacao} autoComplete="new-password" /></Campo>
            <Aviso>{erro}</Aviso>
            <button className="botao primario pilula" disabled={enviando || codigo.length !== 6}>Redefinir senha <ArrowRight size={17} /></button>
            <button type="button" className="botao pilula" disabled={enviando} onClick={() => pedir()}>Reenviar código</button>
          </form>
        )}
        {etapa === 'pronto' && <button className="botao primario pilula" onClick={() => navegar('/entrar')}>Ir para o login <ArrowRight size={17} /></button>}
        <p className="links-auth">Lembrou? <Link to="/entrar"><strong>Voltar para o login</strong></Link></p>
      </section>
      <aside className="auth-lado">
        <span className="auth-etiqueta">Recuperar acesso</span>
        <p style={{ fontSize: 17, maxWidth: 440, margin: 0 }}>O código chega no seu e-mail ou no WhatsApp informado no cadastro e vale por 15 minutos.</p>
        <div className="auth-passos">
          <div className="auth-passo"><b>1</b> Informe o e-mail cadastrado na conta.</div>
          <div className="auth-passo"><b>2</b> Digite o código recebido e escolha a nova senha.</div>
          <div className="auth-passo"><b>3</b> Entre com a senha nova. O código deixa de valer.</div>
        </div>
        <small style={{ color: '#8fa69a' }}>Operadores: peçam ao responsável pela conta para redefinir a senha.</small>
      </aside>
    </div>
  );
}
