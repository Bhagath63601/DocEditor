import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FileText, Users, Settings, Plus, LogOut, Layout as LayoutIcon, Pin } from 'lucide-react';
import { useUser, SignOutButton } from '@clerk/clerk-react';

const Sidebar = ({ 
  isPinned, 
  setIsPinned, 
  isAutoCollapse, 
  setIsAutoCollapse, 
  isHovered, 
  setIsHovered,
  onMouseEnter, 
  onMouseLeave,
  onNewDoc 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const navItems = [
    { icon: FileText, label: 'Documents', path: '/' },
    { icon: Users, label: 'Shared', path: '/shared' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside 
      className={`sidebar ${isHovered ? 'sidebar-hovered' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div style={{ padding: '2.5rem 1.75rem 1.5rem 1.75rem', display: 'flex', alignItems: 'center', gap: '0.875rem', marginBottom: '0.5rem' }}>
        <div style={{ 
          background: 'var(--royal-gold-gradient)', 
          padding: '0.6rem', 
          borderRadius: '0.875rem',
          boxShadow: '0 8px 16px -4px rgba(223, 183, 108, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LayoutIcon size={22} color="#050814" />
        </div>
        <span className="sidebar-brand-text">DocEditor</span>
        
        <button 
          onClick={() => setIsPinned(!isPinned)}
          className="sidebar-pin-btn"
          style={{
            background: 'transparent',
            border: 'none',
            color: isPinned ? 'var(--royal-gold)' : 'rgba(255, 255, 255, 0.25)',
            padding: '0.5rem',
            cursor: 'pointer',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            marginLeft: 'auto'
          }}
          title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
        >
          <Pin size={18} style={{ transform: isPinned ? 'rotate(0deg)' : 'rotate(-45deg)', transition: 'transform 0.2s' }} />
        </button>
      </div>

      <div style={{ padding: '0 1.5rem', marginBottom: '2rem' }}>
        <button 
          className="sidebar-new-doc-btn" 
          onClick={onNewDoc}
        >
          <Plus size={20} /> <span style={{ fontWeight: '700' }}>New Document</span>
        </button>
      </div>

      <nav style={{ flex: 1, padding: '0 1rem' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => {
                navigate(item.path);
                if (!isPinned) {
                  setIsHovered(false);
                }
              }}
              className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
            >
              {isActive && <div className="sidebar-nav-link-indicator" />}
              <item.icon 
                size={20} 
                style={{ 
                  color: isActive ? 'var(--royal-gold)' : 'currentColor',
                  transition: 'transform 0.2s'
                }} 
              />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {/* Auto collapse toggle switch */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 0.5rem', 
          marginBottom: '1.25rem',
          fontSize: '0.825rem',
          color: 'var(--royal-text-muted)',
          borderBottom: '1px solid rgba(223, 183, 108, 0.06)',
          paddingBottom: '0.85rem'
        }}>
          <span style={{ fontWeight: '500' }}>Auto-collapse</span>
          <button 
            onClick={() => setIsAutoCollapse(!isAutoCollapse)}
            style={{
              background: isAutoCollapse ? 'var(--royal-gold)' : 'rgba(255, 255, 255, 0.12)',
              border: 'none',
              width: '36px',
              height: '20px',
              borderRadius: '10px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            title="Toggle auto-collapse when writing"
          >
            <div style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: isAutoCollapse ? '#050814' : 'white',
              position: 'absolute',
              top: '3px',
              left: isAutoCollapse ? '19px' : '3px',
              transition: 'left 0.2s ease'
            }} />
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.25rem 0.5rem', marginBottom: '1.25rem' }}>
          <div style={{ position: 'relative' }}>
            <img 
              src={user?.imageUrl} 
              alt="User" 
              className="sidebar-user-avatar"
            />
            <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '12px', height: '12px', backgroundColor: '#22c55e', border: '2px solid #050814', borderRadius: '50%' }}></div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: '0.9rem', fontWeight: '700', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.fullName || user?.username}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--royal-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
        
        <SignOutButton>
          <button 
            className="sidebar-signout-btn"
          >
            <LogOut size={16} /> <span style={{ fontWeight: '600' }}>Sign out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
};

export default Sidebar;
