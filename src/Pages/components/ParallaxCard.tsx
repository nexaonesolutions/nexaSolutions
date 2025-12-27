import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useParallax } from '../../hooks/useParallax';

interface ParallaxCardProps {
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}

const ParallaxCard: React.FC<ParallaxCardProps> = ({ children, className, ...rest }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { rotateX, rotateY } = useParallax(ref, { offsetX: [-5, 5], offsetY: [5, -5] });

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, perspective: 1000 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default ParallaxCard;
