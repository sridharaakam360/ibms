import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  extra?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, extra }) => {
  return (
    <div className={`bg-white rounded-[20px] p-6 shadow-sm border-none ${className}`}>
      {(title || extra) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h4 className="text-xl font-bold text-navy-700 dark:text-white">{title}</h4>}
          {extra}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;