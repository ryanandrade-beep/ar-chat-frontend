/** Formatos devolvidos pela API (os nomes seguem o JSON do backend). */
export type StatusAtendimento = 'waiting' | 'in_progress' | 'on_hold' | 'finished';
export type StatusMensagem = 'queued' | 'processing' | 'sent' | 'delivered' | 'read' | 'failed';
export type TipoMidia = 'image' | 'document' | 'audio' | 'video';

export interface Midia { type: TipoMidia; url: string; fileName?: string | null }

export interface Cliente {
  id: string; name: string; documentId: string; documentType: string; planType: 'prepaid' | 'postpaid';
  balance: number; limit: number; monthlyUsage: number; available: number; active: boolean; createdAt: string;
}

export interface Operador { id: string; name: string; email: string; active: boolean; createdAt: string; owner?: boolean }
export interface Destinatario { id: string; type: 'contact' | 'group'; name: string; phone: string; acceptsMarketing: boolean }
export interface Departamento { id: string; name: string; active: boolean }
