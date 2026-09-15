import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, LogOut, Mail, RefreshCw, Truck } from 'lucide-react';
import { listUsers, type User } from '../features/users/users.api';
import { logout } from '../features/auth/auth.api';

export function UsersPage() {
  const nav = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    setCarregando(true);
    setErro('');
    try {
      setUsers(await listUsers());
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Falha ao carregar usuários.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { carregar(); }, []);

  async function sair() {
    await logout();
    nav('/login');
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--surface)',
            border: '1px solid var(--border)', display: 'grid', placeItems: 'center' }}>
            <Users size={20} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Usuários</h1>
            <p style={{ margin: '2px 0 0', color: 'var(--muted)', fontSize: 13 }}>
              {users.length} registrado(s)
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => nav('/vehicles')} title="Veículos">
            <Truck size={15} />
          </button>
          <button className="btn btn-ghost" onClick={carregar} title="Recarregar">
            <RefreshCw size={15} />
          </button>
          <button className="btn btn-ghost" onClick={sair}>
            <LogOut size={15} /> Sair
          </button>
        </div>
      </header>

      {erro && <div className="error">{erro}</div>}

      {carregando ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          Carregando...
        </div>
      ) : users.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)' }}>
          Nenhum usuário ainda.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map((u) => (
            <div key={u.id} className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg,#2f81f7,#1f6feb)', display: 'grid', placeItems: 'center',
                fontWeight: 700, fontSize: 16, color: '#fff' }}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{u.name}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 13, marginTop: 2 }}>
                  <Mail size={13} /> {u.email}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                {new Date(u.createdAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
