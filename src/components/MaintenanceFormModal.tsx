import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { MaintenanceInput } from '../features/maintenances/maintenances.api';

interface Props {
  onClose: () => void;
  onSubmit: (input: MaintenanceInput) => Promise<void>;
}

const hoje = () => new Date().toISOString().slice(0, 10);

export function MaintenanceFormModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<MaintenanceInput>({
    description: '',
    cost: 0,
    odometer: 0,
    performedAt: hoje(),
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof MaintenanceInput>(k: K, v: MaintenanceInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Não foi possível salvar a manutenção.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(1,4,9,.7)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Nova manutenção</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, border: 'none' }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: 22 }}>
          {erro && <div className="error">{erro}</div>}
          <div className="field">
            <label>Descrição</label>
            <input className="input" value={form.description} onChange={(e) => set('description', e.target.value)}
              placeholder="Troca de óleo e filtros" required minLength={3} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Custo (R$)</label>
              <input className="input" type="number" step="0.01" min={0} value={form.cost}
                onChange={(e) => set('cost', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label>Hodômetro (km)</label>
              <input className="input" type="number" min={0} value={form.odometer}
                onChange={(e) => set('odometer', Number(e.target.value))} required />
            </div>
          </div>
          <div className="field">
            <label>Data</label>
            <input className="input" type="date" value={form.performedAt}
              onChange={(e) => set('performedAt', e.target.value)} required />
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
