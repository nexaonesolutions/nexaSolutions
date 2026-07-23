import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import './Pages/components/themes-v2.css?v=contrast';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Global error handlers to surface friendly messages for uncaught errors
window.addEventListener('unhandledrejection', (event) => {
  try {
    const reason = event?.reason;
    const msg = reason?.message?.toString?.() || '';

    // Detect common Stripe fetch failures (often blocked by ad-blocker)
    const isStripeBlocked = msg.includes('Failed to fetch') &&
      (msg.includes('r.stripe.com') || msg.includes('m.stripe.com') || (reason?.stack && (reason.stack.includes('r.stripe.com') || reason.stack.includes('m.stripe.com'))));
    const isStripeHttpWarning = msg.includes('Stripe.js integrations must use HTTPS');

    if (isStripeBlocked || isStripeHttpWarning) {
      // Prevent the "Uncaught (in promise)" red error in console
      event.preventDefault();
      return;
    }

    // Detect Nexa Backend connection failures
    if (msg.includes('Failed to fetch')) {
      console.warn('[NEXA] Conexão com o servidor principal temporariamente indisponível.');
    } else {
      console.warn('[NEXA] Uma operação assíncrona falhou ou foi interrompida de forma silenciosa.');
    }
  } catch (e) { }
});

window.addEventListener('error', (event) => {
  try {
    const errorMsg = event.message || '';
    const scriptSrc = event.filename || '';

    // Ignore syntax errors from browser extensions
    if (scriptSrc.includes('chrome-extension://') || errorMsg.includes('webpage_content_reporter.js')) {
      event.preventDefault();
      return;
    }

    // eslint-disable-next-line no-console
    console.warn('[NEXA] Encontramos uma pequena instabilidade visual na interface. Carregando recursos de fallback.');
  } catch (e) { }
}, true); // Use capture phase

// Backup handler for older/specific syntax errors
window.onerror = function (msg, url) {
  if (typeof msg === 'string' && (msg.includes('webpage_content_reporter.js') || (url && url.includes('chrome-extension')))) {
    return true; // Prevents default error firing
  }
  return false;
};