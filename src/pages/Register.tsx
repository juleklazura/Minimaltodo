/// <reference types="react" />
import { useState } from 'react';

function passwordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 2) return { label: 'Fraca', color: '#e57373', value: 1 };
  if (score === 3 || score === 4) return { label: 'Média', color: '#ffb300', value: 2 };
  return { label: 'Forte', color: '#4caf50', value: 3 };
}

function isStrongPassword(password: string) {
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}

export default function Register({ onRegister, onBack }: { onRegister: () => void, onBack: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(password);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Função para checar requisitos da senha
  const passwordRequirements = [
    {
      label: 'Pelo menos 8 caracteres',
      valid: password.length >= 8
    },
    {
      label: 'Uma letra maiúscula',
      valid: /[A-Z]/.test(password)
    },
    {
      label: 'Uma letra minúscula',
      valid: /[a-z]/.test(password)
    },
    {
      label: 'Um número',
      valid: /[0-9]/.test(password)
    },
    {
      label: 'Um caractere especial',
      valid: /[^A-Za-z0-9]/.test(password)
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!isStrongPassword(password)) {
      setError('A senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e símbolo.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erro ao registrar');
      setSuccess(true);
      setTimeout(() => onRegister(), 1200);
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
        <h2>Registrar</h2>
        <input
          type="text"
          placeholder="Nome"
          value={name}
          onChange={e => setName(e.target.value)}
          autoFocus
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="password-input-group" style={{width: '100%', position: 'relative'}}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Senha forte"
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
          <div className="password-strength-bar">
            <div className="password-strength-fill" style={{width: strength.value * 33 + '%', background: strength.color}} />
          </div>
        </div>
        <div className="password-strength-label" style={{color: strength.color}}>{password && `Senha ${strength.label}`}</div>
        <ul style={{
          listStyle: 'none',
          padding: 0,
          margin: '4px 0 8px 0',
          fontSize: '0.98rem',
          width: '100%'
        }}>
          {passwordRequirements.map((req, idx) => (
            <li key={idx} style={{
              color: req.valid ? '#4caf50' : '#e57373',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 500
            }}>
              {req.valid ? (
                <span style={{fontSize: '1.1em'}}>✅</span>
              ) : (
                <span style={{fontSize: '1.1em'}}>❌</span>
              )}
              {req.label}
            </li>
          ))}
        </ul>
        <button type="submit" disabled={loading || !name || !email || !isStrongPassword(password)}>
          {loading ? 'Registrando...' : 'Registrar'}
        </button>
        <button type="button" className="google-btn" onClick={onBack} style={{marginTop: 0}}>
          Voltar para login
        </button>
        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">Registrado com sucesso!</div>}
      </form>
    </div>
  );
}