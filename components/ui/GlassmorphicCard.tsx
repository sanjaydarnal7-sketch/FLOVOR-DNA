
import React from 'react';

interface GlassmorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const GlassmorphicCard: React.FC<GlassmorphicCardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-lg shadow-2xl shadow-black/40 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassmorphicCard;
