import { render } from 'react-dom';
import React from 'react';
import App from './App.jsx';
import CryptoSocket from './CryptoSocket.js';

const socket = new CryptoSocket();

render(
    <App socket={socket}/>,
    document.getElementById('root')
);