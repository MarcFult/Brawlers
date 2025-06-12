import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';


import Login from './login/Login';
import PlayerPage from './login/PlayerPage';
import Register from './register/Register';
import EnterPlayerName from './enterPlayerName/EnterPlayerName';
import Game from "./components/Game.tsx";
import Shop from "./shop/Shop.tsx";

const App: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/player/" element={<PlayerPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/choose-name" element={<EnterPlayerName />} />
        <Route path="/game" element={<Game />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
        <Route path="/shop" element={<Shop/>} />
    </Routes>
  </HashRouter>
);
//         <Route path="/game" element={<Game />} />
export default App;