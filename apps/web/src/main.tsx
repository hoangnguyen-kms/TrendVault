import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@vibe/core/tokens';
import './styles/vibe-overrides.css';
import App from './app';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
