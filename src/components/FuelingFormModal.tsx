import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { FuelingInput } from '../features/fuelings/fuelings.api';

interface Props {
  onClose: () => void;
  onSubmit: (input: FuelingInput) => Promise<void>;
}

const hoje = () => new Date().toISOString().slice(0, 10);

export function FuelingFormModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FuelingInput>({
    liters: 0,
    totalCost: 0,
    odometer: 0,
    fueledAt: hoje(),
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof FuelingInput>(k: K, v: FuelingInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const precoLitro = form.liters > 0 ? (form.totalCost / form.liters) : 0;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await onSubmit(form);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Não foi possível salvar o abastecimento.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(1,4,9,.7)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} className="card" style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Novo abastecimento</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, border: 'none' }}><X size={18} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: 22 }}>
          {erro && <div className="error">{erro}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Litros</label>
              <input className="input" type="number" step="0.001" min={0.001} value={form.liters}
                onChange={(e) => set('liters', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label>Valor total (R$)</label>
              <input className="input" type="number" step="0.01" min={0} value={form.totalCost}
                onChange={(e) => set('totalCost', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label>Hodômetro (km)</label>
              <input className="input" type="number" min={0} value={form.odometer}
                onChange={(e) => set('odometer', Number(e.target.value))} required />
            </div>
            <div className="field">
              <label>Data</label>
              <input className="input" type="date" value={form.fueledAt}
                onChange={(e) => set('fueledAt', e.target.value)} required />
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
            Preço por litro: <strong style={{ color: 'var(--text)' }}>
              {precoLitro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </strong>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
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
