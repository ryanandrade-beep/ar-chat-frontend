import { Link } from 'react-router-dom';
import { MessagesSquare } from 'lucide-react';

export function Termos() {
  return (
    <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 16px 64px' }}>
      <div className="marca" style={{ color: 'var(--tinta)', padding: 0, marginBottom: 24 }}>
        <span className="marca-icone"><MessagesSquare size={18} /></span>A&amp;R Chat
      </div>
      <div className="cartao">
        <div className="cartao-corpo" style={{ display: 'grid', gap: 14 }}>
          <h1>Termos de Uso</h1>
          <p className="selo amarelo" style={{ justifySelf: 'start' }}>Documento fictício · versão 2026-10 · válido apenas para o protótipo acadêmico</p>

          <h2>1. Aceite</h2>
          <p>Ao criar uma conta no A&amp;R Chat, a empresa contratante (“Cliente”) declara ter lido e aceitado estes Termos e a Política de Privacidade. Quem aceita em nome de uma empresa declara ter poderes para isso.</p>

          <h2>2. O serviço</h2>
          <p>O A&amp;R Chat é uma plataforma web para gerenciar o atendimento aos clientes finais pelo WhatsApp e disparar campanhas de marketing. A entrega das mensagens depende do canal de WhatsApp conectado e de serviços de terceiros, que podem ficar indisponíveis.</p>

          <h2>3. Conta e acesso</h2>
          <p>O Cliente é responsável pela veracidade dos dados informados, pelo sigilo da senha e por todas as ações feitas com o seu acesso. Suspeitas de uso indevido devem ser comunicadas imediatamente.</p>

          <h2>4. Preços e cobrança</h2>
          <p>Cada mensagem enviada é cobrada conforme a prioridade escolhida: normal R$ 0,25 e urgente R$ 0,50, independentemente do tipo (texto, imagem, documento, áudio ou vídeo). No plano pré-pago o valor é debitado do saldo; no pós-pago, somado ao consumo do mês, até o limite contratado. Mensagens que não puderem ser entregues após três tentativas têm o valor estornado.</p>

          <h2>5. Uso permitido e campanhas</h2>
          <p>É proibido enviar spam, conteúdo ilícito, ofensivo ou enganoso. Campanhas de marketing só podem ser enviadas a contatos que consentiram em recebê-las, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). O descumprimento pode levar à suspensão da conta.</p>

          <h2>6. Disponibilidade e responsabilidade</h2>
          <p>O serviço é oferecido “no estado em que se encontra”. O A&amp;R Chat não se responsabiliza por bloqueios do número de WhatsApp decorrentes do uso feito pelo Cliente, nem por indisponibilidades de serviços de terceiros.</p>

          <h2>7. Cancelamento</h2>
          <p>O Cliente pode encerrar a conta a qualquer momento. Saldos pré-pagos não utilizados poderão ser devolvidos conforme política comercial vigente.</p>

          <h1 id="privacidade" style={{ marginTop: 18 }}>Política de Privacidade</h1>
          <h2>Dados tratados</h2>
          <p>Dados da conta (nome, e-mail, telefone, CPF/CNPJ), dados dos contatos cadastrados pelo Cliente (nome, telefone e consentimento para ofertas) e o conteúdo das mensagens trocadas pela plataforma.</p>
          <h2>Finalidade</h2>
          <p>Prestar o serviço, cobrar as mensagens, emitir relatórios ao próprio Cliente e cumprir obrigações legais. Os dados não são vendidos a terceiros.</p>
          <h2>Segurança</h2>
          <p>As senhas são armazenadas apenas na forma de hash (bcrypt) e o acesso à API exige token assinado. Os códigos de recuperação de senha valem por 15 minutos.</p>
          <h2>Direitos do titular</h2>
          <p>O titular pode solicitar acesso, correção ou exclusão dos seus dados pelo e-mail fictício privacidade@archat.exemplo.</p>

          <p style={{ color: 'var(--tinta-3)' }}>Última atualização: outubro de 2026.</p>
          <Link to="/cadastro" className="botao" style={{ justifySelf: 'start', textDecoration: 'none' }}>Voltar ao cadastro</Link>
        </div>
      </div>
    </div>
  );
}
