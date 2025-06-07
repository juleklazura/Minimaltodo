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
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(password);

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
      const res = await fetch('http://localhost:4000/auth/register', {
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
        <div className="password-input-group" style={{width: '100%'}}>
          <input
            type="password"
            placeholder="Senha forte"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <div className="password-strength-bar">
            <div className="password-strength-fill" style={{width: strength.value * 33 + '%', background: strength.color}} />
          </div>
        </div>
        <div className="password-strength-label" style={{color: strength.color}}>{password && `Senha ${strength.label}`}</div>
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