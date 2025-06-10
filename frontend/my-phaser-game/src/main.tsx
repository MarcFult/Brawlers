import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Only enforce lobbyId when hitting "/game"
if (window.location.pathname.startsWith('/game')) {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get('lobbyId')) {
    window.location.href = '/lobby.html';
  } else {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
} else {
  // for /login, /player, etc.
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
