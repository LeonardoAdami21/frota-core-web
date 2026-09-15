import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { DocumentInput, DocumentType } from '../features/documents/documents.api';

const TIPOS: { value: DocumentType; label: string }[] = [
  { value: 'IPVA', label: 'IPVA' },
  { value: 'SEGURO', label: 'Seguro' },
  { value: 'LICENCIAMENTO', label: 'Licenciamento' },
  { value: 'DPVAT', label: 'DPVAT' },
  { value: 'VISTORIA', label: 'Vistoria' },
];

const hoje = () => new Date().toISOString().slice(0, 10);

interface Props {
  onClose: () => void;
  onSubmit: (input: DocumentInput) => Promise<void>;
}

export function DocumentFormModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<DocumentInput>({
    type: 'IPVA', dueDate: hoje(), amount: 0, status: 'PENDENTE',
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof DocumentInput>(k: K, v: DocumentInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Não foi possível salvar o documento.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(1,4,9,.7)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Novo documento</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, border: 'none' }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: 22 }}>
          {erro && <div className="error">{erro}</div>}
          <div className="field">
            <label>Tipo</label>
            <select className="input" value={form.type} onChange={(e) => set('type', e.target.value as DocumentType)}>
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Vencimento</label>
              <input className="input" type="date" value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)} required />
            </div>
            <div className="field">
              <label>Valor (R$)</label>
              <input className="input" type="number" step="0.01" min={0} value={form.amount}
                onChange={(e) => set('amount', Number(e.target.value))} required />
            </div>
          </div>
          <div className="field">
            <label>Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as any)}>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" style={{ flex: 1 }} disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
