import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('root element not found');
}

createRoot(rootElement).render(
  // @ts-ignore
  <StrictMode>
    <App />
  </StrictMode>
);
