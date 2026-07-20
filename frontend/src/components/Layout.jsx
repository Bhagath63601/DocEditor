import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { Menu } from 'lucide-react';

const API_BASE = 'http://localhost:5000/documents';

const Layout = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [isPinned, setIsPinned] = useState(() => {
    const saved = localStorage.getItem('sidebar-pinned');
    return saved ? JSON.parse(saved) : true;
  });

  const [isAutoCollapse, setIsAutoCollapse] = useState(() => {
    const saved = localStorage.getItem('sidebar-autocollapse');
    return saved ? JSON.parse(saved) : true;
  });

  const [isHovered, setIsHovered] = useState(false);
  const [isMouseOverSidebar, setIsMouseOverSidebar] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // Sync state modifications to local storage
  useEffect(() => {
    localStorage.setItem('sidebar-pinned', JSON.stringify(isPinned));
  }, [isPinned]);

  useEffect(() => {
    localStorage.setItem('sidebar-autocollapse', JSON.stringify(isAutoCollapse));
  }, [isAutoCollapse]);

  // Handle auto-collapse when idle outside the sidebar
  useEffect(() => {
    if (!isPinned || !isAutoCollapse || isMouseOverSidebar) return;

    // Collapse after 4 seconds of inactivity outside sidebar
    const timer = setTimeout(() => {
      setIsPinned(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isPinned, isAutoCollapse, isMouseOverSidebar]);

  // Collapse instantly on keypress (typing) if mouse is not over sidebar
  useEffect(() => {
    if (!isPinned || !isAutoCollapse || isMouseOverSidebar) return;

    const handleKeyDown = () => {
      setIsPinned(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPinned, isAutoCollapse, isMouseOverSidebar]);

  const handleSidebarMouseEnter = () => {
    setIsMouseOverSidebar(true);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!isPinned) {
      setIsHovered(true);
    }
  };

  const handleSidebarMouseLeave = () => {
    setIsMouseOverSidebar(false);
    if (!isPinned) {
      // Short delay before closing to prevent annoying accidental mouse-outs
      hoverTimeoutRef.current = setTimeout(() => {
        setIsHovered(false);
      }, 500);
    }
  };

  const handleHoverZoneMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const triggerSidebarCreateDoc = async () => {
    try {
      const token = await getToken();
      const res = await axios.post(API_BASE, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/documents/${res.data._id}`);
    } catch (err) {
      console.error('Error creating document:', err);
    }
  };

  return (
    <div className={`app-layout ${isPinned ? 'sidebar-pinned' : 'sidebar-unpinned'}`}>
      <div className={`sidebar-flow-spacer ${isPinned ? '' : 'collapsed'}`} />
      
      <Sidebar 
        isPinned={isPinned}
        setIsPinned={setIsPinned}
        isAutoCollapse={isAutoCollapse}
        setIsAutoCollapse={setIsAutoCollapse}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
        onMouseEnter={handleSidebarMouseEnter}
        onMouseLeave={handleSidebarMouseLeave}
        onNewDoc={triggerSidebarCreateDoc}
      />

      {/* Edge hover trigger zone */}
      {!isPinned && (
        <div 
          className="sidebar-hover-zone"
          onMouseEnter={handleHoverZoneMouseEnter}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            width: '16px',
            zIndex: 999,
          }}
        />
      )}

      {/* Floating Toggle Icon */}
      {!isPinned && (
        <button
          onClick={() => {
            setIsPinned(true);
            setIsHovered(false);
          }}
          className="sidebar-floating-toggle-btn"
          title="Pin sidebar"
        >
          <Menu size={20} />
        </button>
      )}

      <main className={`main-content ${isPinned ? '' : 'sidebar-unpinned-content'}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
