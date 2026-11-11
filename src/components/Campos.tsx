import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export function CampoIcone({ icone, ...props }: { icone: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="campo-icone">
      {icone}
      <input className="entrada" {...props} />
    </div>
  );
}

export function CampoSenha({ valor, aoMudar, autoComplete = 'current-password', placeholder = '••••••••' }: {
  valor: string; aoMudar: (v: string) => void; autoComplete?: string; placeholder?: string;
}) {
  const [ver, setVer] = useState(false);
  return (
    <div className="campo-icone">
      <Lock size={17} />
      <input className="entrada" type={ver ? 'text' : 'password'} value={valor} onChange={(e) => aoMudar(e.target.value)}
             required autoComplete={autoComplete} placeholder={placeholder} style={{ paddingRight: 44 }} />
      <button type="button" className="olho" onClick={() => setVer(!ver)} aria-label={ver ? 'Ocultar senha' : 'Mostrar senha'}>
        {ver ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
