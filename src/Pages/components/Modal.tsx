import React, { useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  const isLight = false;

  // Bloqueia a rolagem da página de fundo quando o modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
        opacity: 1,
        transition: 'opacity 0.3s ease-in-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
          color: isLight ? '#000000' : '#ffffff',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          border: isLight ? '1px solid #e0e0e0' : '1px solid #333',
          position: 'relative',
          transform: 'translateY(0)',
          transition: 'transform 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho Fixo */}
        <div style={{
          padding: '20px 25px',
          borderBottom: isLight ? '1px solid #eee' : '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: isLight ? '#666' : '#aaa',
              fontSize: '28px',
              lineHeight: '1',
              cursor: 'pointer',
              padding: '0 5px',
              display: 'flex',
              alignItems: 'center'
            }}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        {/* Conteúdo com Rolagem */}
        <div style={{
          padding: '25px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          lineHeight: '1.6'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};