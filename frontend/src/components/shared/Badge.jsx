import React from 'react';

const VARIANTS = {
  green: 'badge-green', blue: 'badge-blue', yellow: 'badge-yellow',
  red: 'badge-red', purple: 'badge-purple', gray: 'badge-gray', accent: 'badge-accent',
};

const Badge = ({ children, variant = 'gray', className = '' }) => (
  <span className={`badge ${VARIANTS[variant] || ''} ${className}`}>{children}</span>
);

export default Badge;
