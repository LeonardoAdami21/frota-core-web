import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Wrench, Fuel, Receipt, FileText, Plus, Trash2, Gauge, Calendar,
  Truck, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { isAdmin } from '../features/auth/auth.api';
import { getVehicle, type Vehicle } from '../features/vehicles/vehicles.api';
import {
  listMaintenances, createMaintenance, deleteMaintenance, type Maintenance,
} from '../features/maintenances/maintenances.api';
import {
  listFuelings, createFueling, deleteFueling, type Fueling,
} from '../features/fuelings/fuelings.api';
import {
  listExpenses, createExpense, deleteExpense, type Expense,
} from '../features/expenses/expenses.api';
import {
  listDocuments, createDocument, deleteDocument, payDocument, type VehicleDocument,
} from '../features/documents/documents.api';
import { MaintenanceFormModal } from '../components/MaintenanceFormModal';
import { FuelingFormModal } from '../components/FuelingFormModal';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { DocumentFormModal } from '../components/DocumentFormModal';

const brl = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (s: string) => new Date(s).toLocaleDateString('pt-BR');

type Aba = 'maintenances' | 'fuelings' | 'expenses' | 'documents';

const CATEGORIA_LABEL: Record<string, string> = {
  PNEUS: 'Pneus', PEDAGIO: 'Pedágio', LAVAGEM: 'Lavagem',
  MULTA: 'Multa', ESTACIONAMENTO: 'Estacionamento', OUTROS: 'Outros',
};
const TIPO_LABEL: Record<string, string> = {
  IPVA: 'IPVA', SEGURO: 'Seguro', LICENCIAMENTO: 'Licenciamento', DPVAT: 'DPVAT', VISTORIA: 'Vistoria',
};

export function VehicleDetailPage() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const admin = isAdmin();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [aba, setAba] = useState<Aba>('maintenances');
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [fuelings, setFuelings] = useState<Fueling[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [modal, setModal] = useState<Aba | null>(null);

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      const [v, m, f, e, d] = await Promise.all([
        getVehicle(id),
        listMaintenances(id),
        listFuelings(id),
        listExpenses(id),
        listDocuments(id),
      ]);
      setVehicle(v);
      setMaintenances(m);
      setFuelings(f);
      setExpenses(e);
      setDocuments(d);
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Falha ao carregar os dados do veículo.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, [id]);

  // handlers manutenção
  async function salvarManutencao(input: any) {
    await createMaintenance(id, input); setModal(null); setMaintenances(await listMaintenances(id));
  }
  async function removerManutencao(mId: string) {
    if (!confirm('Remover esta manutenção?')) return;
    await deleteMaintenance(id, mId); setMaintenances(await listMaintenances(id));
  }
  // handlers abastecimento
  async function salvarAbastecimento(input: any) {
    await createFueling(id, input); setModal(null); setFuelings(await listFuelings(id));
  }
  async function removerAbastecimento(fId: string) {
    if (!confirm('Remover este abastecimento?')) return;
    await deleteFueling(id, fId); setFuelings(await listFuelings(id));
  }
  // handlers despesa
  async function salvarDespesa(input: any) {
    await createExpense(id, input); setModal(null); setExpenses(await listExpenses(id));
  }
  async function removerDespesa(eId: string) {
    if (!confirm('Remover esta despesa?')) return;
    await deleteExpense(id, eId); setExpenses(await listExpenses(id));
  }
  // handlers documento
  async function salvarDocumento(input: any) {
    await createDocument(id, input); setModal(null); setDocuments(await listDocuments(id));
  }
  async function pagarDocumento(dId: string) {
    await payDocument(id, dId); setDocuments(await listDocuments(id));
  }
  async function removerDocumento(dId: string) {
    if (!confirm('Remover este documento?')) return;
    await deleteDocument(id, dId); setDocuments(await listDocuments(id));
  }

  const totalManut = maintenances.reduce((s, m) => s + m.cost, 0);
  const totalAbast = fuelings.reduce((s, f) => s + f.totalCost, 0);
  const totalDespesas = expenses.reduce((s, e) => s + e.amount, 0);
  const totalGeral = totalManut + totalAbast + totalDespesas;
  const docsPendentes = documents.filter((d) => d.status !== 'PAGO').length;

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 20px' }}>
      <button className="btn btn-ghost" style={{ marginBottom: 20 }} onClick={() => nav('/vehicles')}>
        <ArrowLeft size={15} /> Voltar
      </button>

      {erro && <div className="error">{erro}</div>}

      {carregando ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Carregando...</div>
      ) : !vehicle ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>Veículo não encontrado.</div>
      ) : (
        <>
          <div className="card" style={{ padding: 22, marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg)',
                border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                <Truck size={24} color="var(--accent)" />
              </div>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>{vehicle.brand} {vehicle.model}</h1>
                <div style={{ fontSize: 13, color: 'var(--muted)', fontFamily: 'monospace' }}>
                  {vehicle.plate} · {vehicle.year} · {vehicle.odometer.toLocaleString('pt-BR')} km
                </div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 18 }}>
              <ResumoBox label="Custo total" valor={brl(totalGeral)} />
              <ResumoBox label="Manutenção" valor={brl(totalManut)} />
              <ResumoBox label="Combustível" valor={brl(totalAbast)} />
              <ResumoBox label="Despesas" valor={brl(totalDespesas)} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            <TabButton ativo={aba === 'maintenances'} onClick={() => setAba('maintenances')} icon={Wrench} label={`Manutenções (${maintenances.length})`} />
            <TabButton ativo={aba === 'fuelings'} onClick={() => setAba('fuelings')} icon={Fuel} label={`Abastecimentos (${fuelings.length})`} />
            <TabButton ativo={aba === 'expenses'} onClick={() => setAba('expenses')} icon={Receipt} label={`Despesas (${expenses.length})`} />
            <TabButton ativo={aba === 'documents'} onClick={() => setAba('documents')} icon={FileText} label={`Documentos (${documents.length})`} alerta={docsPendentes > 0} />
            <div style={{ flex: 1 }} />
            {admin && (
              <button className="btn btn-primary" style={{ width: 'auto', padding: '9px 15px' }} onClick={() => setModal(aba)}>
                <Plus size={16} /> Adicionar
              </button>
            )}
          </div>

          {aba === 'maintenances' && (
            maintenances.length === 0 ? <Vazio texto="Nenhuma manutenção registrada." /> : (
              <Lista>
                {maintenances.map((m) => (
                  <Linha key={m.id} icon={<Wrench size={18} color="#f0c14b" />}
                    titulo={m.description}
                    sub={<><Meta icon={Calendar} texto={dataBR(m.performedAt)} /><Meta icon={Gauge} texto={`${m.odometer.toLocaleString('pt-BR')} km`} /></>}
                    valor={brl(m.cost)} onRemover={() => removerManutencao(m.id)} podeEditar={admin} />
                ))}
              </Lista>
            )
          )}

          {aba === 'fuelings' && (
            fuelings.length === 0 ? <Vazio texto="Nenhum abastecimento registrado." /> : (
              <Lista>
                {fuelings.map((f) => (
                  <Linha key={f.id} icon={<Fuel size={18} color="#5ee6a8" />}
                    titulo={`${f.liters.toLocaleString('pt-BR')} L · ${brl(f.pricePerLiter)}/L`}
                    sub={<><Meta icon={Calendar} texto={dataBR(f.fueledAt)} /><Meta icon={Gauge} texto={`${f.odometer.toLocaleString('pt-BR')} km`} /></>}
                    valor={brl(f.totalCost)} onRemover={() => removerAbastecimento(f.id)} podeEditar={admin} />
                ))}
              </Lista>
            )
          )}

          {aba === 'expenses' && (
            expenses.length === 0 ? <Vazio texto="Nenhuma despesa registrada." /> : (
              <Lista>
                {expenses.map((e) => (
                  <Linha key={e.id} icon={<Receipt size={18} color="#7d9cf7" />}
                    titulo={e.description}
                    sub={<><Tag texto={CATEGORIA_LABEL[e.category] ?? e.category} /><Meta icon={Calendar} texto={dataBR(e.spentAt)} /></>}
                    valor={brl(e.amount)} onRemover={() => removerDespesa(e.id)} podeEditar={admin} />
                ))}
              </Lista>
            )
          )}

          {aba === 'documents' && (
            documents.length === 0 ? <Vazio texto="Nenhum documento cadastrado." /> : (
              <Lista>
                {documents.map((d) => {
                  const pago = d.status === 'PAGO';
                  const cor = pago ? '#5ee6a8' : d.overdue ? '#f08080' : d.daysUntilDue <= 30 ? '#f0c14b' : '#7d8590';
                  const aviso = pago ? 'Pago'
                    : d.overdue ? `Vencido há ${Math.abs(d.daysUntilDue)}d`
                    : `Vence em ${d.daysUntilDue}d`;
                  return (
                    <div key={d.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg)',
                        border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
                        <FileText size={18} color={cor} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{TIPO_LABEL[d.type] ?? d.type}</div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12.5, marginTop: 3 }}>
                          <Meta icon={Calendar} texto={dataBR(d.dueDate)} />
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: cor, fontWeight: 600 }}>
                            {!pago && d.overdue && <AlertTriangle size={12} />}{aviso}
                          </span>
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{brl(d.amount)}</div>
                      {admin && !pago && (
                        <button onClick={() => pagarDocumento(d.id)} title="Marcar como pago"
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#5ee6a8', padding: 4 }}>
                          <CheckCircle2 size={17} />
                        </button>
                      )}
                      {admin && (
                        <button onClick={() => removerDocumento(d.id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </Lista>
            )
          )}
        </>
      )}

      {modal === 'maintenances' && <MaintenanceFormModal onClose={() => setModal(null)} onSubmit={salvarManutencao} />}
      {modal === 'fuelings' && <FuelingFormModal onClose={() => setModal(null)} onSubmit={salvarAbastecimento} />}
      {modal === 'expenses' && <ExpenseFormModal onClose={() => setModal(null)} onSubmit={salvarDespesa} />}
      {modal === 'documents' && <DocumentFormModal onClose={() => setModal(null)} onSubmit={salvarDocumento} />}
    </div>
  );
}

function ResumoBox({ label, valor }: { label: string; valor: string }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11.5, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700 }}>{valor}</div>
    </div>
  );
}

function TabButton({ ativo, onClick, icon: Icon, label, alerta }: {
  ativo: boolean; onClick: () => void; icon: any; label: string; alerta?: boolean;
}) {
  return (
    <button onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
        border: '1px solid ' + (ativo ? 'var(--accent)' : 'var(--border-strong)'),
        background: ativo ? 'rgba(47,129,247,.12)' : 'transparent',
        color: ativo ? 'var(--text)' : 'var(--muted)', fontSize: 13.5, fontWeight: 600, position: 'relative' }}>
      <Icon size={15} /> {label}
      {alerta && <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#f0c14b', display: 'inline-block' }} />}
    </button>
  );
}

function Lista({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{children}</div>;
}

function Linha({ icon, titulo, sub, valor, onRemover, podeEditar }: {
  icon: React.ReactNode; titulo: string; sub: React.ReactNode; valor: string; onRemover: () => void; podeEditar: boolean;
}) {
  return (
    <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--bg)',
        border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{titulo}</div>
        <div style={{ display: 'flex', gap: 12, color: 'var(--muted)', fontSize: 12.5, marginTop: 3, alignItems: 'center' }}>{sub}</div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 15 }}>{valor}</div>
      {podeEditar && (
        <button onClick={onRemover} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 4 }}>
          <Trash2 size={15} />
        </button>
      )}
    </div>
  );
}

function Meta({ icon: Icon, texto }: { icon: any; texto: string }) {
  return <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icon size={12} /> {texto}</span>;
}

function Tag({ texto }: { texto: string }) {
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      background: 'var(--border)', color: 'var(--text)' }}>{texto}</span>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)', fontSize: 14, borderStyle: 'dashed' }}>
      {texto}
    </div>
  );
}
