import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Truck, Wrench, Fuel, Receipt, LogOut,
  RefreshCw, AlertTriangle, DollarSign, ChevronRight, Circle,
} from 'lucide-react';
import { getDashboard, type DashboardData } from '../features/dashboard/dashboard.api';
import { logout, currentUser } from '../features/auth/auth.api';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (s: string) => new Date(s).toLocaleDateString('pt-BR');
const TIPO_LABEL: Record<string, string> = {
  IPVA: 'IPVA', SEGURO: 'Seguro', LICENCIAMENTO: 'Licenciamento', DPVAT: 'DPVAT', VISTORIA: 'Vistoria',
};

export function DashboardPage() {
  const nav = useNavigate();
  const user = currentUser();
  const [data, setData] = useState<DashboardData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setData(await getDashboard());
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Falha ao carregar o painel.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function sair() {
    await logout();
    nav('/login');
  }

  const cards = data ? [
    { label: 'Custo total', valor: brl(data.costs.total), icon: DollarSign, cor: '#2f81f7' },
    { label: 'Veículos ativos', valor: `${data.fleet.active}/${data.fleet.total}`, icon: Truck, cor: '#5ee6a8' },
    { label: 'Em manutenção', valor: String(data.fleet.maintenance), icon: Wrench, cor: '#f0c14b' },
    { label: 'Alertas de vencimento', valor: String(data.alerts.length), icon: AlertTriangle, cor: '#f08080' },
  ] : [];

  const maxCusto = data && data.costByVehicle.length > 0
    ? Math.max(...data.costByVehicle.map((c) => c.total)) : 0;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface)',
            border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
            <LayoutDashboard size={20} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Painel da frota</h1>
            <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              {user?.name}
              {user && (
                <span style={{ fontSize: 10.5, fontWeight: 700, padding: '2px 8px', borderRadius: 20, letterSpacing: 0.3,
                  background: user.role === 'ADMIN' ? '#1a3a2e' : '#26324a',
                  color: user.role === 'ADMIN' ? '#5ee6a8' : '#7d9cf7' }}>
                  {user.role === 'ADMIN' ? 'ADMIN' : 'OPERADOR (leitura)'}
                </span>
              )}
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => nav('/vehicles')} title="Veículos"><Truck size={15} /></button>
          <button className="btn btn-ghost" onClick={carregar} title="Recarregar"><RefreshCw size={15} /></button>
          <button className="btn btn-ghost" onClick={sair}><LogOut size={15} /> Sair</button>
        </div>
      </header>

      {erro && <div className="error">{erro}</div>}

      {carregando ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Carregando...</div>
      ) : !data ? null : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
            {cards.map((c) => (
              <div key={c.label} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--muted)', fontSize: 12.5 }}>{c.label}</span>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: c.cor + '22', display: 'grid', placeItems: 'center' }}>
                    <c.icon size={16} color={c.cor} />
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, marginTop: 12 }}>{c.valor}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18 }}>
            {/* Alertas */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <AlertTriangle size={17} color="#f0c14b" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Vencimentos próximos</h3>
              </div>
              {data.alerts.length === 0 ? (
                <p style={{ color: 'var(--muted)', fontSize: 13 }}>Tudo em dia. Nenhum documento a vencer em 30 dias.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.alerts.map((a, i) => {
                    const venc = a.overdue;
                    return (
                      <div key={i} onClick={() => nav(`/vehicles/${a.vehicleId}`)}
                        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                          background: venc ? '#2d1416' : '#2a2410', border: `1px solid ${venc ? '#5c2626' : '#514418'}` }}>
                        <Circle size={8} fill={venc ? '#f08080' : '#f0c14b'} color={venc ? '#f08080' : '#f0c14b'} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 500 }}>
                            {TIPO_LABEL[a.type] ?? a.type} · {a.plate}
                          </div>
                          <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>
                            {venc ? `Vencido há ${Math.abs(a.daysUntilDue)}d` : `Vence em ${a.daysUntilDue}d`} · {dataBR(a.dueDate)}
                          </div>
                        </div>
                        <ChevronRight size={15} color="var(--muted)" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Divisão de custos */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <DollarSign size={17} color="#2f81f7" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Custos por tipo</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <CustoLinha icon={Wrench} cor="#f0c14b" label="Manutenção" valor={data.costs.maintenance} total={data.costs.total} />
                <CustoLinha icon={Fuel} cor="#5ee6a8" label="Combustível" valor={data.costs.fueling} total={data.costs.total} />
                <CustoLinha icon={Receipt} cor="#7d9cf7" label="Despesas" valor={data.costs.expense} total={data.costs.total} />
              </div>
            </div>
          </div>

          {/* Ranking de custo por veículo */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Truck size={17} color="#5ee6a8" />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Custo por veículo</h3>
            </div>
            {data.costByVehicle.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 13 }}>Ainda não há lançamentos de custo.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.costByVehicle.map((c) => (
                  <div key={c.vehicleId} onClick={() => nav(`/vehicles/${c.vehicleId}`)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
                      <span style={{ fontWeight: 500 }}>{c.label} <span style={{ color: 'var(--muted)', fontFamily: 'monospace' }}>· {c.plate}</span></span>
                      <span style={{ fontWeight: 700 }}>{brl(c.total)}</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${maxCusto ? (c.total / maxCusto) * 100 : 0}%`,
                        background: 'linear-gradient(90deg,#2f81f7,#1f6feb)', borderRadius: 20 }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function CustoLinha({ icon: Icon, cor, label, valor, total }: {
  icon: any; cor: string; label: string; valor: number; total: number;
}) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 5 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Icon size={14} color={cor} /> {label}</span>
        <span style={{ fontWeight: 600 }}>{brl(valor)} <span style={{ color: 'var(--muted)', fontSize: 11.5 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 6, background: 'var(--bg)', borderRadius: 20, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: cor, borderRadius: 20 }} />
      </div>
    </div>
  );
}
