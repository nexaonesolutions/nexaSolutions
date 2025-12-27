import { useState, MouseEvent } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export const useRipple = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = (e: MouseEvent<HTMLElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, size, id: Date.now() };
    
    setRipples((prev) => [...prev, newRipple]);

    // Cleanup ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== newRipple.id));
    }, 600);
  };

  return { ripples, createRipple };
};
