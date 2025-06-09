import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';


import Login from './login/Login';
import PlayerPage from './login/PlayerPage';
import Register from './register/Register';
import EnterPlayerName from './enterPlayerName/EnterPlayerName';


const App: React.FC = () => (
  <HashRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/player/" element={<PlayerPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/choose-name" element={<EnterPlayerName />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  </HashRouter>
);

export default App;