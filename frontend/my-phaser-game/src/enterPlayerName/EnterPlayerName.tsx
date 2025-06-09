// src/enterPlayerName/EnterPlayerName.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EnterPlayerName.css';

type LocationState = {
  userId?: number;
  registered?: boolean;
};

const EnterPlayerName: React.FC = () => {
  // 1) form state
  const [name, setName]       = useState('');
  const [error, setError]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // 2) router hooks
  const navigate = useNavigate();
  const location = useLocation() as { state?: LocationState };
  const userId   = location.state?.userId;

  // 3) redirect if we got here accidentally
  useEffect(() => {
    if (!userId) {
      // No userId → back to registration
      navigate('/register', { replace: true });
    }
  }, [userId, navigate]);

  // 4) submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;         // safety guard
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(
        `http://localhost:8080/players/user/${userId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        }
      );

      if (resp.ok) {
        setSuccess(true);
        // After 1s, redirect to login
        setTimeout(() => navigate('/login', { replace: true }), 1000);
      } else {
        const data = await resp.json();
        setError(data.error || 'Could not create player');
      }
    } catch (err) {
      console.error(err);
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // 5) render
  const bg = '/assets/enterPlayer.png';
  return (
    <main
      className="name-wrapper"
      role="presentation"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <form className="name-form" onSubmit={handleSubmit}>
        <label htmlFor="player" className="sr-only">Player name</label>
        <input
          id="player"
          className="name-input"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
          required
          disabled={loading || success}
        />

        <button
          type="submit"
          className="ok-btn"
          disabled={loading || success}
          aria-label="OK"
        >
          {loading ? '...' : ''}
        </button>

        {error && <p className="name-error">{error}</p>}
      </form>

      {success && (
        <div className="name-success">
          Profile created!
        </div>
      )}
    </main>
  );
};

export default EnterPlayerName;
