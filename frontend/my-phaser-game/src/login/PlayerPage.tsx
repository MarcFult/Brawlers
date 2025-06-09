import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import './playerPage.css';

interface Player {
  id: number;
  userId: number;
  name: string;
  ects: number;
  gameObjects: string[];
  levels: string[];
}

const PlayerPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/players/user/${userId}`, {
      credentials: 'include',
      headers: { 'Accept': 'application/json' }
    })
      .then(res => res.json())
      .then(setPlayer)
      .catch(console.error);
  }, [userId]);

  useEffect(() => {
    if (!player || !containerRef.current || gameRef.current) return;
    const currentPlayer = player;

    class DashboardScene extends Phaser.Scene {
      constructor() { super({ key: 'DashboardScene' }); }
      preload() {
        currentPlayer.gameObjects.forEach(obj => {
          this.load.image(obj, `/assets/char/${obj}_left.png`);
        });
      }
      create() {
        this.add.text(20,20, `Welcome, ${currentPlayer.name}`, { font: '24px Arial' });
        currentPlayer.gameObjects.forEach((obj, i) => {
          const sprite = this.add.image(100 + i*150, 200, obj)
                        .setScale(0.5)
                        .setInteractive();

          // on click, make it jump
          sprite.on('pointerdown', () => {
            this.tweens.add({
              targets: sprite,
              y: sprite.y - 50,
              duration: 200,
              yoyo: true,
              ease: 'Power1'
            });
          });
        });
      }
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 800,
      height: 600,
      scene: DashboardScene
    };
    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [player]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8080/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch { /* empty */ }
    navigate('/login');
  };

  if (!player) return <div className="loading">Loading player...</div>;

  return (
    <div className="player-page">
      <button className="logout-button" onClick={handleLogout}>Logout</button>
      <header className="player-header">
        <h1>{player.name}'s Dashboard</h1>
        <div className="stats">
          <span>ECTS: {player.ects}</span>
          <span>Levels: {player.levels.join(', ') || 'None'}</span>
        </div>
      </header>
      <div ref={containerRef} className="game-container" />
    </div>
  );
};

export default PlayerPage;