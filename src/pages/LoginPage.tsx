import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, ShieldCheck } from 'lucide-react';
import { login, register } from '../features/auth/auth.api';

export function LoginPage() {
  const nav = useNavigate();
  const [modo, setModo] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      if (modo === 'register') {
        await register(name, email, password);
      }
      await login(email, password);
      nav('/dashboard');
    } catch (err: any) {
      setErro(err?.response?.data?.message ?? 'Não foi possível concluir. Verifique os dados.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 20 }}>
      <div className="card" style={{ width: '100%', maxWidth: 380, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9,
            background: 'linear-gradient(135deg,#2f81f7,#1f6feb)', display: 'grid', placeItems: 'center' }}>
            <ShieldCheck size={20} color="#fff" />
          </div>
          <h1 style={{ fontSize: 20, margin: 0, fontWeight: 700 }}>
            {modo === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 24px' }}>
          {modo === 'login' ? 'Acesse com suas credenciais.' : 'Preencha para se registrar.'}
        </p>

        {erro && <div className="error">{erro}</div>}

        <form onSubmit={onSubmit}>
          {modo === 'register' && (
            <div className="field">
              <label>Nome</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Senha</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <button className="btn btn-primary" disabled={carregando} style={{ marginTop: 8 }}>
            {modo === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {carregando ? 'Aguarde...' : modo === 'login' ? 'Entrar' : 'Registrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--muted)' }}>
          {modo === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <a onClick={() => { setModo(modo === 'login' ? 'register' : 'login'); setErro(''); }} style={{ cursor: 'pointer' }}>
            {modo === 'login' ? 'Criar agora' : 'Entrar'}
          </a>
        </p>
      </div>
    </div>
  );
}
