import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const urlParams = new URLSearchParams(window.location.search);
const lobbyId = urlParams.get('lobbyId');

    ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
        <React.StrictMode>
            <App/>
        </React.StrictMode>
    );
