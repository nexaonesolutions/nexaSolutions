import React from 'react';

const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-nexa-dark flex flex-col items-center justify-center z-50">
      <div className="relative flex items-center justify-center w-20 h-20 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-t-cyan-400 border-r-transparent border-b-cyan-600 border-l-transparent animate-spin"></div>
        <span className="text-cyan-400 text-3xl font-bold font-sans">N</span>
      </div>
      <p className="text-cyan-400 text-sm font-medium animate-pulse tracking-widest uppercase">
        Carregando...
      </p>
    </div>
  );
};

export default PageLoader;
