import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useInView, animate } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  label: string;
}

const AnimatedStat: React.FC<AnimatedStatProps> = ({ value, suffix, label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (isInView) {
      if (prefersReducedMotion) {
        count.set(value);
        return;
      }
      const controls = animate(count, value, { duration: 2, ease: "easeOut" });
      return () => controls.stop();
    }
  }, [isInView, value, count, prefersReducedMotion]);

  return (
    <div ref={ref}>
      <div className="text-3xl font-bold text-white">
        <motion.span>{rounded}</motion.span>
        {suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
};

export default AnimatedStat;
