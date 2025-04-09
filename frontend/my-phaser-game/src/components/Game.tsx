import React, { useEffect } from 'react';
import Phaser from 'phaser';
import BoxScene from '../scenes/BoxScene';


const Game: React.FC = () => {
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-example',
      width: 800,
      height: 600,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }, // Include both x and y properties
          debug: false
        }
      },
      scene: [BoxScene]
    };

    new Phaser.Game(config);
  }, []);

  return <div id="phaser-example" />;
};

export default Game;
