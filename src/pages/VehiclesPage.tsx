import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, LogOut, RefreshCw, Plus, Pencil, Trash2, Users, Gauge, User, LayoutDashboard } from 'lucide-react';
import {
  listVehicles, createVehicle, updateVehicle, deleteVehicle,
  type Vehicle, type VehicleInput,
} from '../features/vehicles/vehicles.api';
import { logout, isAdmin } from '../features/auth/auth.api';
import { VehicleFormModal } from '../components/VehicleFormModal';

const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  ATIVO: { label: 'Ativo', bg: '#1a3a2e', fg: '#5ee6a8' },
  MANUTENCAO: { label: 'Manutenção', bg: '#3a2e14', fg: '#f0c14b' },
  INATIVO: { label: 'Inativo', bg: '#3a1a1a', fg: '#f08080' },
};

export function VehiclesPage() {
  const nav = useNavigate();
  const admin = isAdmin();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Vehicle | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setVehicles(await listVehicles());
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Falha ao carregar veículos.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  function abrirNovo() {
    setEditando(null);
    setModalAberto(true);
  }

  function abrirEdicao(v: Vehicle) {
    setEditando(v);
    setModalAberto(true);
  }

  async function salvar(input: VehicleInput) {
    if (editando) {
      await updateVehicle(editando.id, input);
    } else {
      await createVehicle(input);
    }
    setModalAberto(false);
    await carregar();
  }

  async function remover(v: Vehicle) {
    if (!confirm(`Remover o veículo ${v.plate}?`)) return;
    try {
      await deleteVehicle(v.id);
      await carregar();
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Falha ao remover.');
    }
  }

  async function sair() {
    await logout();
    nav('/login');
  }

  const ativos = vehicles.filter((v) => v.status === 'ATIVO').length;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface)',
            border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
            <Truck size={20} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Veículos</h1>
            <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 13 }}>
              {vehicles.length} no total · {ativos} ativo(s)
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => nav('/dashboard')} title="Painel">
            <LayoutDashboard size={15} />
          </button>
          <button className="btn btn-ghost" onClick={() => nav('/users')} title="Usuários">
            <Users size={15} />
          </button>
          <button className="btn btn-ghost" onClick={carregar} title="Recarregar">
            <RefreshCw size={15} />
          </button>
          {admin && (
            <button className="btn btn-primary" style={{ width: 'auto', padding: '9px 15px' }} onClick={abrirNovo}>
              <Plus size={16} /> Adicionar
            </button>
          )}
          <button className="btn btn-ghost" onClick={sair}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </header>

      {erro && <div className="error">{erro}</div>}

      {carregando ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Carregando...</div>
      ) : vehicles.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          Nenhum veículo cadastrado. Clique em <strong style={{ color: 'var(--text)' }}>Adicionar</strong> para começar.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {vehicles.map((v) => {
            const meta = STATUS_META[v.status] ?? STATUS_META.INATIVO;
            return (
              <div key={v.id} className="card" style={{ padding: 18, position: 'relative', cursor: 'pointer' }}
                onClick={() => nav(`/vehicles/${v.id}`)}>
                {admin && <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4 }}>
                  <button onClick={(e) => { e.stopPropagation(); abrirEdicao(v); }} title="Editar"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                    <Pencil size={15} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); remover(v); }} title="Remover"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </div>}

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg)',
                    border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                    <Truck size={20} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{v.brand} {v.model}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--muted)', fontFamily: 'monospace' }}>{v.plate}</div>
                  </div>
                </div>

                <span style={{ display: 'inline-block', fontSize: 11.5, fontWeight: 600, padding: '3px 10px',
                  borderRadius: 20, background: meta.bg, color: meta.fg, marginBottom: 14 }}>
                  {meta.label}
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
                    <span style={{ color: 'var(--text)' }}>{v.year}</span> · ano
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
                    <Gauge size={13} /> {v.odometer.toLocaleString('pt-BR')} km
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted)' }}>
                    <User size={13} /> {v.driver ?? '—'}
                  </div>
                </div>

                <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)',
                  fontSize: 12.5, color: 'var(--accent)', fontWeight: 600 }}>
                  Ver manutenções e abastecimentos →
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <VehicleFormModal initial={editando} onClose={() => setModalAberto(false)} onSubmit={salvar} />
      )}
    </div>
  );
}
