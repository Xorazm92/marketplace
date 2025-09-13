import React from 'react';
import styles from './Divider.module.scss';

interface DividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const Divider: React.FC<DividerProps> = ({ 
  className = '', 
  orientation = 'horizontal' 
}) => {
  return (
    <div 
      className={`${styles.divider} ${styles[orientation]} ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
};

export default Divider;
