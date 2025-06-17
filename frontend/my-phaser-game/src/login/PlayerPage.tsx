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
  const [email]             = useState<string>(state?.email ?? '');
  const [player, setPlayer] = useState<Player | null>(null);
  const gameRef             = useRef<Phaser.Game | null>(null);
  const containerRef        = useRef<HTMLDivElement>(null);

  // If no userId in state (e.g. after full page reload), look it up by email
  useEffect(() => {
    if (userId !== null) return;
    if (!email) {
      navigate('/login', { replace: true });
      return;
    }
    fetch(
      `http://localhost:8080/auth/user?email=${encodeURIComponent(email)}`,
      { credentials: 'include' }
    )
      .then(r => r.json())
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
      .then(r => r.json())
      .then(setPlayer)
      .catch(console.error);
  }, [userId]);

  // Spin up Phaser with a transparent canvas when the player data arrives
  useEffect(() => {
    if (!player || !containerRef.current || gameRef.current) return;
    const cp = player;

    class DashboardScene extends Phaser.Scene {
      preload() {
        cp.gameObjects.forEach(obj =>
          this.load.image(obj, `src/assets/char/${obj}_left.png`)
        );
      }
      create() {
       

        // draw each sprite at y = 550 so it's 50px from the bottom of the 600px canvas
        cp.gameObjects.slice(2,3).forEach((obj, i) => {
          const spr = this.add
            .image(100 + i * 150, 280, obj)
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
    window.location.href = '/lobby.html';
  };

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
      {/* invisible hit-area over the “C” box */}
   <button
  className="logout-button"
  onClick={handleLogout}
>
  Logout
  </button>

      {/* Header pinned to the top-center of the 800×800 board */}
      <header className="player-header" style={{color: '#fff'}}>
        <h1>Welcome, {player.name}</h1>
        <div className="stats">

          <button
              onClick={goToShop}
              style={{
                position: 'relative',
                top: '60px',      // 100px nach unten
                left: '300px',     // 300px nach rechts
                padding: '8.8px 17.6px', // 10% größer
                fontSize: '17.6px',      // 10% größer als 16px
                cursor: 'pointer',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: "transparent",
                color: 'transparent',
                transform: 'scale(2)', // zusätzliche Skalierung (optional)
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

  {/* Phaser container sits 20px above the bottom */
  }
  <div ref={containerRef} className="game-container"/>

  {/* invisible hit-area over the “Lobbys” frame */
  }
  <button
      className="lobby-button"
          onClick={handleLobby}
          aria-label="Go to Lobby"
      />
    </main>
  );
};

export default PlayerPage;
