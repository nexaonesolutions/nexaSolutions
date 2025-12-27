import { useMotionValue, useTransform, MotionValue } from 'framer-motion';
import { RefObject, useEffect } from 'react';
import { usePrefersReducedMotion } from './usePrefersReducedMotion';

interface ParallaxOptions {
  offsetX?: [number, number];
  offsetY?: [number, number];
}

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
    if (!element || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const xPct = mouseX / width - 0.5;
      const yPct = mouseY / height - 0.5;
      x.set(xPct);
      y.set(yPct);
    };

    const handleMouseLeave = () => {
      x.set(0);
      y.set(0);
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, x, y, prefersReducedMotion]);

  return { rotateX, rotateY };
};
