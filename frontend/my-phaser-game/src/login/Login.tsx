// src/login/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

interface LoginResponse {
  id: number;
  email: string;
  error?: string;
}

const Login: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const loginBg = '/assets/login.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await resp.json();
      if (resp.ok && data.id) {
        // Pass both userId and email in state
        navigate('/player', { state: { userId: data.id, email } });
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-wrapper" style={{ backgroundImage: `url(${loginBg})` }}>
      <form className="login-form" onSubmit={handleSubmit}>
        <label htmlFor="email" className="sr-only">E-Mail</label>
        <input
          id="email"
          className="login-input email-login-field"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
          disabled={loading}
        />

        <label htmlFor="password" className="sr-only">Password</label>
        <input
          id="password"
          className="login-input password-login-field"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="loginn-btn"
          disabled={loading}
          aria-label="Anmelden"
        >
          {loading ? '...' : ''}
        </button>

        {error && <p className="login-error">{error}</p>}
      </form>
    </main>
  );
};

export default Login;
