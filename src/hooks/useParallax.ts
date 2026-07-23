import { useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { RefObject, useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface ParallaxOptions {
  offsetX?: [number, number];
  offsetY?: [number, number];
}

// Detect touch devices — parallax is mousemove-only and wastes GPU on mobile
const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

export const useParallax = (
  ref: RefObject<HTMLElement>,
  options?: ParallaxOptions
): { rotateX: MotionValue<number>; rotateY: MotionValue<number> } => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  const rotateX = useTransform(y, [-0.5, 0.5], options?.offsetY || [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], options?.offsetX || [-10, 10]);

  useEffect(() => {
    const element = ref.current;
    // Skip entirely on touch devices and when reduced motion is preferred
    if (!element || prefersReducedMotion || isTouchDevice()) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const xPct = (e.clientX - rect.left) / rect.width - 0.5;
      const yPct = (e.clientY - rect.top) / rect.height - 0.5;
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove, { passive: true });
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, x, y, prefersReducedMotion]);

  return { rotateX, rotateY };
};
