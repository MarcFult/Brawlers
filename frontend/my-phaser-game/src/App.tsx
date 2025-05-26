import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScreen from './components/HomeScreen';
import Game from './components/Game';


const App: React.FC = () => {
  return (
      <Router>
    <div className="App bg-gray-100 p-4">
        <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/game" element={<Game />} />
        </Routes>
    </div>
      </Router>
  );
};

export default App;
