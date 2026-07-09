import React, { useState, useEffect } from 'react';

const COOKIE_KEY = 'nexa_cookie_consent';

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_KEY);
    if (!consent) {
      // Small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (accepted: boolean) => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem(COOKIE_KEY, accepted ? 'accepted' : 'rejected');
      setVisible(false);
      setLeaving(false);
    }, 400);
  };

  if (!visible) return null;

  return (
    <>
      {/* Overlay sutil */}
      <div
        className={`fixed inset-0 z-[9998] pointer-events-none transition-opacity duration-500 ${leaving ? 'opacity-0' : 'opacity-100'}`}
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 40%)' }}
      />

      {/* Banner */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Aviso de cookies"
        className={`
          fixed bottom-0 left-0 right-0 z-[9999]
          transition-all duration-500 ease-out
          ${leaving ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'}
        `}
      >
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(15, 18, 30, 0.92)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 -4px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(var(--color-primary)/0.15)',
            }}
          >
            {/* Barra decorativa no topo */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: 'linear-gradient(90deg, rgb(var(--color-primary)), rgb(var(--color-secondary)), rgb(var(--color-primary)))' }}
            />

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 sm:p-6">
              {/* Ícone */}
              <div
                className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: 'rgba(var(--color-primary)/0.15)',
                  border: '1px solid rgba(var(--color-primary)/0.25)',
                }}
              >
                🍪
              </div>

              {/* Texto */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm mb-0.5">
                  Usamos cookies para melhorar sua experiência
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Utilizamos cookies essenciais para o funcionamento do site e cookies analíticos para entender como você o usa.
                  Ao continuar, você concorda com nossa{' '}
                  <a
                    href="#/termos-de-uso"
                    className="underline underline-offset-2 transition-colors"
                    style={{ color: 'rgb(var(--color-primary))' }}
                    onClick={() => dismiss(true)}
                  >
                    Política de Privacidade
                  </a>.
                </p>
              </div>

              {/* Botões */}
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  id="cookie-reject-btn"
                  onClick={() => dismiss(false)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-medium text-gray-400 transition-all duration-200 hover:text-white hover:bg-white/5 border border-white/10 hover:border-white/20"
                >
                  Rejeitar
                </button>
                <button
                  id="cookie-accept-btn"
                  onClick={() => dismiss(true)}
                  className="flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                  style={{
                    background: 'linear-gradient(135deg, rgb(var(--color-primary)), rgb(var(--color-secondary)))',
                    boxShadow: '0 0 20px rgba(var(--color-primary)/0.35)',
                  }}
                >
                  Aceitar tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;
