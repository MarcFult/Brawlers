// src/register/Register.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

interface RegisterResponse {
  id?: number;
  error?: string;
}

const Register: React.FC = () => {
  const [email, setEmail]       = useState('');
  const [pw, setPw]             = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();
  const bg = './src/assets/registration.png';
  //   const bg = './src/assets/registration.png';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      //10.0.40.186
      const resp = await fetch('http://10.0.40.186:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pw }),
      });

      // Always parse JSON, whether 200 or 400
      const result: RegisterResponse = await resp.json();

      if (resp.ok && result.id != null) {
        // Success → pass userId into the next screen
        navigate('/choose-name', { state: { userId: result.id } });
      } else {
        // Either a 400 or missing id on 200
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="reg-wrapper"
      role="presentation"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form className="reg-form" onSubmit={handleSubmit}>
        <label htmlFor="email" className="sr-only">E-Mail</label>
        <input
          id="email"
          className="reg-input email-field"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
          disabled={loading}
        />

        <label htmlFor="pw" className="sr-only">Password</label>
        <input
          id="pw"
          className="reg-input password-field"
          type="password"
          value={pw}
          onChange={e => setPw(e.target.value)}
          autoComplete="new-password"
          required
          disabled={loading}
        />

        <button
          type="submit"
          className="reg-btn"
          disabled={loading}
          aria-label="Register"
        >
          {loading ? 'Registering…' : ''}
        </button>

        <button
          type="button"
          className="login-btn"
          onClick={() => navigate('/login')}
          aria-label="Go to Login"
        />

        {error && <p className="reg-error">{error}</p>}
      </form>
    </main>
  );
};

export default Register;
