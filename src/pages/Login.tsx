/// <reference types="react" />
import { useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

export default function Login({ onLogin, onShowRegister }: { onLogin: (token: string, user: any) => void, onShowRegister: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao logar');
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="login-title">Minimal Todo</div>
        <h2>Login</h2>
        <input
          type="text"
          placeholder="Usuário"
          value={username}
          onChange={e => setUsername(e.target.value)}
          autoFocus
        />
        <div className="password-input-group" style={{width: '100%', position: 'relative'}}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{paddingRight: '38px'}}
          />
          <button
            type="button"
            tabIndex={-1}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              width: 28,
              height: 28
            }}
          >
            {showPassword ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C7 19 2.73 15.11 1 12c.73-1.26 2.07-3.17 4.06-4.94M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-5.12"/><path d="M1 1l22 22"/></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="12" rx="10" ry="6"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        </div>
        <button type="submit" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        <button type="button" className="google-btn" onClick={onShowRegister} style={{marginTop: 0}}>
          Registrar
        </button>
        {error && <div className="login-error">{error}</div>}
      </form>
    </div>
  );
}