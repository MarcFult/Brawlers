import React, { useEffect } from 'react';
import Phaser from 'phaser';
import BoxScene from '../scenes/BoxScene';
import SkinSelectScene from '../scenes/SkinSelectScene';
import DeathScene from '../scenes/DeathScene';
import WinScene from '../scenes/WinScene';

const Game: React.FC = () => {
  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-example',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1134,
        height: 1110
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [ SkinSelectScene, BoxScene, DeathScene, WinScene ]
    };

    const game = new Phaser.Game(config);

    // ── now hand off the player's skins into SkinSelectScene ──
    const raw = sessionStorage.getItem("dlc-player");
    if (!raw) {
      console.warn("No player data; redirecting to login");
      window.location.href = "/login";
    } else {
      try {
        const playerData = JSON.parse(raw) as { skins: string[] };
        game.scene.start("SkinSelectScene", { skins: playerData.skins });
      } catch (e) {
        console.error("Invalid dlc-player payload", e);
        window.location.href = "/login";
      }
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div id="phaser-example" />;
};

export default Game;
