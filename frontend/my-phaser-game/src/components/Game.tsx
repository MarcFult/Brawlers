import React, { useEffect } from 'react';
import Phaser from 'phaser';
import BoxScene from '../scenes/BoxScene';


const Game: React.FC = () => {
  useEffect(() => {

    const config = {
      type: Phaser.AUTO,
      parent: 'phaser-example',
      width: 1134,
      height: 1110,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 }, // Include both x and y properties
          debug: false

        }
      },
      scene: [BoxScene]
    };

    const game = new Phaser.Game(config);
    // ^ wir speichern das Game in einer Variable danke chat

    return () => {
      game.destroy(true);
      // ^ wenn Component weggeht -> zerstöre das Game sauber
    };

  }, []);

  return <div id="phaser-example"



  />;
};

export default Game;
