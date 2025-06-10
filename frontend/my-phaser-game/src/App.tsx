import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';


import Login from './login/Login';
import PlayerPage from './login/PlayerPage';
import Register from './register/Register';
import EnterPlayerName from './enterPlayerName/EnterPlayerName';
import Shop from './shop/Shop';


const App: React.FC = () => (
  <HashRouter>
    <Routes>

      <Route path="/login" element={<Login />} />
      <Route path="/player/:userId" element={<PlayerPage />} />
        <Route path="/shop" element={<Shop />} />
      <Route path="/register" element={<Register />} />
      <Route path="/choose-name" element={<EnterPlayerName />} />
      <Route path="*" element={<Navigate to="/register" replace />} />

    </Routes>
  </HashRouter>
);

export default App;