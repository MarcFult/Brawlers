import React from 'react';
import { useNavigate } from 'react-router-dom';



function HomeScreen() {
    const navigate = useNavigate();

    const handlePlayGame = () => {
        navigate('/game'); // Weiterleitung zur Phaser-Game-Komponente
    };

    return (
        <div className="home-screen">
            <h1 className="text-4xl font-bold mb-8">Brawlers</h1>
            <button
                className="play-button bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-xl transition-colors"
                onClick={handlePlayGame}
            >
                Play Game
            </button>
        </div>
    );
}

export default HomeScreen;