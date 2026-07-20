import React, { useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ActiveUsersTooltip = ({ users, currentUser, triggerRef, onMouseEnter, onMouseLeave }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Safety guard: Ensure users is an array
  if (!Array.isArray(users) || users.length === 0) {
    if (users) console.warn("ActiveUsersTooltip: users prop is not a valid array", users);
    return null;
  }

  useLayoutEffect(() => {
    if (!triggerRef?.current) return;

    const updatePosition = () => {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 240; // Matches width defined in CSS
      const gap = 10;
      
      const top = triggerRect.bottom + gap;
      
      // Align right edge of tooltip with right edge of trigger
      let left = triggerRect.right - tooltipWidth;
      
      const margin = 16; // 1rem safety margin from screen edges
      
      // Edge boundary checks
      if (left < margin) {
        left = margin;
      }
      if (left + tooltipWidth > window.innerWidth - margin) {
        left = window.innerWidth - tooltipWidth - margin;
      }

      setCoords({ top, left });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true); // Capture inner container scroll events

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [triggerRef]);

  const content = (
    <div 
      className="active-users-tooltip glass fade-in"
      style={{
        position: 'fixed',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        zIndex: 9999, // Raise z-index to avoid overlap
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="tooltip-header">
        Active Now ({users.length})
      </div>
      <div className="user-list">
        {users.map((u, i) => (
          <div key={i} className="user-list-item">
            {u?.avatar ? (
              <img 
                src={u.avatar} 
                alt={u.name} 
                className="user-status-indicator" 
                style={{ width: 16, height: 16, borderRadius: '50%', objectFit: 'cover' }} 
              />
            ) : (
              <div 
                className="user-status-indicator" 
                style={{ backgroundColor: u?.color || '#cbd5e1' }}
              />
            )}
            <div className="user-info">
              <span className="user-name">
                {u?.name || 'Unknown User'}
                {(u?.name === (currentUser?.fullName || currentUser?.username)) && <span className="me-badge">(You)</span>}
              </span>
              {u?.tag && <span className="user-tag">#{u.tag}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default ActiveUsersTooltip;
