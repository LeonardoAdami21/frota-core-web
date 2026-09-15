import { useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Vehicle, VehicleInput, VehicleStatus } from '../features/vehicles/vehicles.api';

const STATUS: { value: VehicleStatus; label: string }[] = [
  { value: 'ATIVO', label: 'Ativo' },
  { value: 'MANUTENCAO', label: 'Manutenção' },
  { value: 'INATIVO', label: 'Inativo' },
];

interface Props {
  initial?: Vehicle | null;
  onClose: () => void;
  onSubmit: (input: VehicleInput) => Promise<void>;
}

/** Modal usado tanto para criar quanto para editar um veículo. */
export function VehicleFormModal({ initial, onClose, onSubmit }: Props) {
  const editando = Boolean(initial);
  const [form, setForm] = useState<VehicleInput>({
    plate: initial?.plate ?? '',
    model: initial?.model ?? '',
    brand: initial?.brand ?? '',
    year: initial?.year ?? new Date().getFullYear(),
    odometer: initial?.odometer ?? 0,
    status: initial?.status ?? 'ATIVO',
    driver: initial?.driver ?? '',
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function set<K extends keyof VehicleInput>(k: K, v: VehicleInput[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await onSubmit({ ...form, driver: form.driver?.trim() || undefined });
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Não foi possível salvar o veículo.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(1,4,9,.7)', display: 'grid', placeItems: 'center', padding: 20, zIndex: 50 }}>
      <div onClick={(e) => e.stopPropagation()} className="card"
        style={{ width: '100%', maxWidth: 460, maxHeight: '88vh', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{editando ? 'Editar veículo' : 'Novo veículo'}</h3>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 6, border: 'none' }}><X size={18} /></button>
        </div>

        <form onSubmit={submit} style={{ padding: 22 }}>
          {erro && <div className="error">{erro}</div>}

          <div className="field">
            <label>Placa</label>
            <input className="input" value={form.plate} onChange={(e) => set('plate', e.target.value)}
              placeholder="ABC1D23" required disabled={editando} />
            {editando && <small style={{ color: 'var(--muted)', fontSize: 11 }}>A placa não pode ser alterada.</small>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label>Marca</label>
              <input className="input" value={form.brand} onChange={(e) => set('brand', e.target.value)} required minLength={2} />
            </div>
            <div className="field">
              <label>Modelo</label>
              <input className="input" value={form.model} onChange={(e) => set('model', e.target.value)} required minLength={2} />
            </div>
            <div className="field">
              <label>Ano</label>
              <input className="input" type="number" value={form.year}
                onChange={(e) => set('year', Number(e.target.value))} required min={1950} />
            </div>
            <div className="field">
              <label>Hodômetro (km)</label>
              <input className="input" type="number" value={form.odometer}
                onChange={(e) => set('odometer', Number(e.target.value))} required min={0} />
            </div>
          </div>

          <div className="field">
            <label>Status</label>
            <select className="input" value={form.status} onChange={(e) => set('status', e.target.value as VehicleStatus)}>
              {STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          <div className="field">
            <label>Motorista (opcional)</label>
            <input className="input" value={form.driver ?? ''} onChange={(e) => set('driver', e.target.value)} />
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
