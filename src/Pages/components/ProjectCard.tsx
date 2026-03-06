import React, { useState } from 'react';
import { Modal } from './Modal';
import { motion } from 'framer-motion';
import styles from './ProjectCard.module.css';

interface ProjectCardProps {
  title: string;
  shortDescription: string;
  fullDescription: React.ReactNode;
  imageSrc: string;
  technologies?: string[];
  style?: React.CSSProperties;
}

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 }
  },
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  shortDescription,
  fullDescription,
  imageSrc,
  technologies = [],
  style
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div
        className={styles.card}
        variants={cardVariants}
        style={style}
        onClick={() => setIsModalOpen(true)}
      >
        <div className={styles.imageContainer}>
           <img 
             src={imageSrc} 
             alt={title} 
             className={styles.image}
           />
        </div>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.shortDescription}>
            {shortDescription}
          </p>
          <div className={styles.tagsContainer}>
            {technologies.map((tech, index) => (
              <span key={index} className={styles.techTag}>{tech}</span>
            ))}
          </div>
        </div>
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
      >
        <div className="space-y-6">
          <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-lg bg-gray-900">
            <img
              src={imageSrc}
              alt={title}
              className="w-full h-auto object-cover max-h-[400px]"
            />
          </div>
          <div className="text-gray-300 text-base leading-relaxed">
            {fullDescription}
          </div>
        </div>
      </Modal>
    </>
  );
};