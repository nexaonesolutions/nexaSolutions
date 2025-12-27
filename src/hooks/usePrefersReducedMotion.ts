import { useState, useEffect } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

export const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    mediaQuery.addEventListener('change', listener);

    return () => {
      mediaQuery.removeEventListener('change', listener);
    };
  }, []);

  return prefersReducedMotion;
};
