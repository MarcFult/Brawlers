import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const startGame = () => {
        navigate('/game');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-6xl font-bold mb-8">Welcome to Brawling!</h1>
            <button
                className="px-8 py-4 text-2xl font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300"
                onClick={startGame}
            >
                Start Game
            </button>
        </div>
    );
};

export default HomePage;