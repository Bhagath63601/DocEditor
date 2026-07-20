import React from 'react';

const Skeleton = ({ width = '100%', height = '20px', borderRadius = 'var(--radius-md)' }) => {
  return (
    <div 
      style={{ 
        width, 
        height, 
        borderRadius, 
        background: 'linear-gradient(90deg, var(--border) 25%, var(--card-hover) 50%, var(--border) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s infinite linear'
      }} 
    />
  );
};

export const CardSkeleton = () => (
  <div className="doc-card" style={{ cursor: 'default' }}>
    <Skeleton width="60%" height="24px" />
    <Skeleton width="40%" height="16px" />
    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
      <Skeleton width="30%" height="20px" borderRadius="1rem" />
      <Skeleton width="20%" height="16px" />
    </div>
  </div>
);

// Add keyframes to a style tag if not in CSS
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = `
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;
  document.head.appendChild(style);
}

export default Skeleton;
