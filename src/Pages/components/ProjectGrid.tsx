import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProjectGrid.module.css';

interface ProjectGridProps {
  children: React.ReactNode;
}

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15, // Atraso entre a animação de cada item filho
    },
  },
};

export const ProjectGrid: React.FC<ProjectGridProps> = ({ children }) => {
  return (
    <motion.div
      className={styles.grid}
      variants={gridContainerVariants}
    >
      {children}
    </motion.div>
  );
};