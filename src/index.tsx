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
    // Log concise, friendly message and underlying reason
    // Many Stripe/network libs throw FetchError which can be noisy; surface helpful info
    // eslint-disable-next-line no-console
    const reason = event?.reason;
    const msg = reason?.message?.toString?.() || '';
    // Detect common Stripe fetch failures (often blocked by adblock) and show guidance
    if (msg.includes('Failed to fetch') && (msg.includes('r.stripe.com') || (reason && reason.stack && reason.stack.includes('r.stripe.com')))) {
      console.warn('[Global] Stripe network request failed. This is often caused by an ad-blocker or network blocking r.stripe.com. Disable/whitelist adblock for testing.');
    }
    console.error('[Global] Unhandled promise rejection:', reason ?? event);
  } catch (e) {}
});

window.addEventListener('error', (event) => {
  try {
    // eslint-disable-next-line no-console
    console.error('[Global] Uncaught error:', event.error || event.message || event);
  } catch (e) {}
});