import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Game from './components/Game';
import HomeScreen from "./components/HomeScreen.tsx";
import Shop from "./components/Shop.tsx";


const App: React.FC = () => {
  return (
      <Router>
    <div className="App bg-gray-100 p-4">
        <Routes>
            <Route path="/home" element={<HomeScreen/>} />
            <Route path="/shop" element={<Shop/>} />
            <Route path="/game" element={<Game />} />
        </Routes>
    </div>
      </Router>
  );
};

export default App;
