import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { ExpenseInput, ExpenseCategory } from '../features/expenses/expenses.api';

const CATEGORIAS: { value: ExpenseCategory; label: string }[] = [
  { value: 'PNEUS', label: 'Pneus' },
  { value: 'PEDAGIO', label: 'Pedágio' },
  { value: 'LAVAGEM', label: 'Lavagem' },
  { value: 'MULTA', label: 'Multa' },
  { value: 'ESTACIONAMENTO', label: 'Estacionamento' },
  { value: 'OUTROS', label: 'Outros' },
];

const hoje = () => new Date().toISOString().slice(0, 10);

interface Props {
  onClose: () => void;
  onSubmit: (input: ExpenseInput) => Promise<void>;
}

export function ExpenseFormModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<ExpenseInput>({
    category: 'PEDAGIO', description: '', amount: 0, spentAt: hoje(),
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof ExpenseInput>(k: K, v: ExpenseInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Não foi possível salvar a despesa.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(1,4,9,.7)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Nova despesa</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, border: 'none' }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: 22 }}>
          {erro && <div className="error">{erro}</div>}
          <div className="field">
            <label>Categoria</label>
            <select className="input" value={form.category} onChange={(e) => set('category', e.target.value as ExpenseCategory)}>
              {CATEGORIAS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Descrição</label>
            <input className="input" value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Rota SP-RJ" required minLength={2} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Valor (R$)</label>
              <input className="input" type="number" step="0.01" min={0} value={form.amount}
                onChange={(e) => set('amount', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label>Data</label>
              <input className="input" type="date" value={form.spentAt}
                onChange={(e) => set('spentAt', e.target.value)} required />
            </div>
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
