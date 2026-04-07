import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DiceProvider } from './context/DiceContext';
import { DatabaseProvider } from './context/DatabaseContext';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <DatabaseProvider>
      <DiceProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </DiceProvider>
    </DatabaseProvider>
  </StrictMode>,
);
