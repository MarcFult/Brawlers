// src/login/PlayerPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import './PlayerPage.css';

interface Player {
  id: number;
  userId: number;
  name: string;
  ects: number;
  gameObjects: string[];
  levels: string[];
}

const PlayerPage: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useLocation() as {
    state?: { userId?: number; email?: string };
  };
  const [userId, setUserId] = useState<number | null>(state?.userId ?? null);
  const [email] = useState<string>(state?.email ?? '');
  const [player, setPlayer] = useState<Player | null>(null);
  const [showInventory, setShowInventory] = useState(false);
  const [activeTab, setActiveTab] = useState<'skins' | 'levels'>('skins');

  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // If no userId in state (e.g. after full page reload), look it up by email
  useEffect(() => {
    if (userId !== null) return;
    if (!email) {
      navigate('/login', { replace: true });
      return;
    }
    fetch(`http://localhost:8080/auth/user?email=${encodeURIComponent(email)}`, {
      credentials: 'include',
    })
        .then((r) => r.json())
        .then((j: { id: number }) => setUserId(j.id))
        .catch(() => navigate('/login', { replace: true }));
  }, [userId, email, navigate]);

  // Once we have a userId, fetch the Player record
  useEffect(() => {
    if (userId === null) return;
    fetch(`http://localhost:8080/players/user/${userId}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
        .then((r) => r.json())
        .then(setPlayer)
        .catch(console.error);
  }, [userId]);

  // Spin up Phaser with a transparent canvas when the player data arrives
  useEffect(() => {
    if (!player || !containerRef.current || gameRef.current) return;
    const cp = player;

    class DashboardScene extends Phaser.Scene {
      preload() {
        cp.gameObjects.forEach((obj) =>
            this.load.image(obj, `src/assets/char/${obj}_left.png`)
        );
      }

      create() {
        cp.gameObjects.forEach((obj, i) => {
          const spr = this.add
              .image(20 + i * 30, 180, obj)
              .setScale(0.5)
              .setInteractive();

          spr.on('pointerdown', () => {
            this.tweens.add({
              targets: spr,
              y: spr.y - 50,
              duration: 200,
              yoyo: true,
              ease: 'Power1',
            });
          });
        });
      }
    }

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      transparent: true,
      scene: DashboardScene,
    });

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [player]);

  const handleLogout = async () => {
    await fetch('http://localhost:8080/auth/logout', {
      method: 'POST',
      credentials: 'include',
    }).catch(() => {});
    navigate('/login', { replace: true });
  };

  const handleLobby = () => {
    if (userId !== null) {
      // UserId im sessionStorage speichern
      sessionStorage.setItem('userId', userId.toString());
      // Dann zur Lobby wechseln (ohne UserId in URL)
      window.location.href = '/lobby.html';
    } else {
      alert('User-ID fehlt');
    }
  }

  const goToShop = () => {
    if (userId !== null) {
      navigate('/shop', { state: { userId } });
    } else {
      alert('User-ID fehlt');
    }
  };

  if (player === null) {
    return <div className="loading">Loading player…</div>;
  }

  return (
      <main className="player-page">
        <button className="logout-button" onClick={handleLogout} aria-label="Logout" />
        <button className="inventory-button" onClick={() => setShowInventory(true)} aria-label="Open Inventory" />

        <header className="player-header" style={{ color: '#fff' }}>
          <h1>Welcome, {player.name}</h1>
        </header>

        {showInventory && (
            <div className="inventory-overlay">
              <button className="inventory-close-button" onClick={() => setShowInventory(false)}>×</button>

              <div className="inventory-player-info">
                <p>ECTS: {player.ects}</p>
                <p>Levels: {player.levels.length > 0 ? player.levels.join(', ') : 'None'}</p>
              </div>

              <div className="inventory-tabs">
                <button className={activeTab === 'skins' ? 'active' : ''} onClick={() => setActiveTab('skins')}>Skins</button>
                <button className={activeTab === 'levels' ? 'active' : ''} onClick={() => setActiveTab('levels')}>Levels</button>
              </div>
      {/* Header pinned to the top-center of the 800×800 board */}
      <header className="player-header" style={{color: '#fff'}}>
        <h1>Welcome, {player.name}</h1>
        <div className="stats">

          <button
              onClick={goToShop}
              style={{
                position: 'relative',
                top: '60px',
                left: '300px',
                padding: '8.8px 17.6px',
                fontSize: '17.6px',
                cursor: 'pointer',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: "transparent",
                color: 'transparent',
                transform: 'scale(2)',
              }}
          >
            Zum Shop
          </button>



        {/* <span>ECTS: {player.ects}</span>
          <span>
            Levels:{' '}
            {player.levels.length
              ? player.levels.join(', ')
              : 'None'}
          </span> */}
      </div>
    </header>

              <div className="inventory-content">
                {activeTab === 'skins' && (
                    <div className="skins-grid">
                      {player.gameObjects.length === 0 ? (
                          <p>Keine Skins freigeschaltet</p>
                      ) : (
                          player.gameObjects.map((skin, i) => (
                              <div key={i} className="skin-item">
                                <img src={`src/assets/char/${skin}_left.png`} alt={skin} />
                                <p>{skin}</p>
                              </div>
                          ))
                      )}
                    </div>
                )}

                {activeTab === 'levels' && (
                    <div className="levels-list">
                      {player.levels.length === 0 ? (
                          <p>Keine freigespielten Levels</p>
                      ) : (
                          <ul>
                            {player.levels.map((lvl, i) => (
                                <li key={i}>{lvl}</li>
                            ))}
                          </ul>
                      )}
                    </div>
                )}
              </div>
            </div>
        )}

        <div ref={containerRef} className="game-container" />
        <button className="lobby-button" onClick={handleLobby} aria-label="Go to Lobby" />
      </main>
  );

};

export default PlayerPage;
