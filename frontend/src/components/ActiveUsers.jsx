import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';

const ActiveUsers = React.memo(({ provider, currentUser }) => {
    console.log('[PROFILER] ActiveUsers rendered');

    const [activeUsers, setActiveUsers] = useState([]);

    useEffect(() => {
        if (!provider) return;

        const handleAwarenessUpdate = () => {
            const states = provider.awareness.getStates();
            const users = Array.from(states.values())
                .filter(state => state.user)
                .map(state => state.user);
            
            setActiveUsers(users);
        };

        // Subscribe to awareness events
        provider.awareness.on('change', handleAwarenessUpdate);
        handleAwarenessUpdate(); // Init state

        return () => {
            provider.awareness.off('change', handleAwarenessUpdate);
        };
    }, [provider]);

    const displayUsers = activeUsers.slice(0, 5);
    const extraCount = activeUsers.length - displayUsers.length;

    return (
        <ErrorBoundary>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {/* Stacked avatars */}
                <div className="avatar-stack" style={{ display: 'flex', alignItems: 'center' }}>
                    {displayUsers.map((u, i) => {
                        const isTyping = u?.isTyping;
                        const statusLabel = isTyping ? 'Typing' : 'Viewing';
                        const statusColor = isTyping ? '#10b981' : '#f59e0b'; // Green vs Yellow
                        
                        return (
                            <div 
                                key={i} 
                                className="presence-avatar-container"
                                style={{ 
                                    position: 'relative',
                                    marginLeft: i > 0 ? '-10px' : '0', 
                                    zIndex: 100 - i,
                                }}
                            >
                                {u?.avatar ? (
                                    <img 
                                        src={u.avatar} 
                                        alt={u.name} 
                                        className="presence-avatar"
                                        style={{ 
                                            width: 32, 
                                            height: 32, 
                                            borderRadius: '50%', 
                                            border: `2.5px solid ${u.color || '#3b82f6'}`, 
                                            objectFit: 'cover',
                                            boxShadow: `0 0 10px ${u.color || '#3b82f6'}`,
                                            transition: 'all 0.25s ease'
                                        }} 
                                    />
                                ) : (
                                    <div 
                                        className="presence-avatar initial-avatar"
                                        style={{ 
                                            width: 32, 
                                            height: 32, 
                                            borderRadius: '50%', 
                                            border: `2.5px solid ${u.color || '#3b82f6'}`, 
                                            backgroundColor: u?.color || '#cbd5e1', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            fontSize: '13px', 
                                            color: '#fff', 
                                            fontWeight: '700',
                                            boxShadow: `0 0 10px ${u.color || '#3b82f6'}`,
                                            transition: 'all 0.25s ease'
                                        }}
                                    >
                                        {u?.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                )}
                                
                                {/* Status dot badge on the avatar itself */}
                                <span 
                                    className="presence-status-dot"
                                    style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        right: 0,
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        backgroundColor: statusColor,
                                        border: '1.5px solid var(--bg)',
                                        boxShadow: '0 0 4px rgba(0,0,0,0.4)',
                                    }}
                                />

                                {/* Custom CSS tooltip */}
                                <div className="presence-tooltip">
                                    <div className="presence-tooltip-name">
                                        {u?.name || 'Unknown User'}
                                        {u?.id === currentUser?.id && <span className="presence-tooltip-me"> (You)</span>}
                                    </div>
                                    <div className="presence-tooltip-status">
                                        <span 
                                            className="presence-tooltip-dot" 
                                            style={{ backgroundColor: statusColor }}
                                        />
                                        {statusLabel}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {extraCount > 0 && (
                        <div 
                            className="presence-avatar extra-avatar"
                            style={{ 
                                width: 32, 
                                height: 32, 
                                borderRadius: '50%', 
                                border: '2px solid var(--bg)', 
                                backgroundColor: '#334155', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                fontSize: '11px', 
                                color: '#fff', 
                                fontWeight: '600',
                                marginLeft: '-10px', 
                                zIndex: 90,
                                boxShadow: 'var(--shadow-sm)'
                            }}
                        >
                            +{extraCount}
                        </div>
                    )}
                </div>

                {/* Presence count */}
                <div 
                    className="presence-editing-badge" 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.4rem', 
                        padding: '0.35rem 0.75rem', 
                        borderRadius: '2rem', 
                        fontSize: '0.8rem', 
                        color: 'var(--text)', 
                        fontWeight: '600', 
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid var(--border)',
                        cursor: 'default'
                    }}
                >
                    <span style={{ fontSize: '1.1em' }}>👥</span> {activeUsers.length} editing
                </div>
            </div>
        </ErrorBoundary>
    );
});

ActiveUsers.displayName = 'ActiveUsers';

export default ActiveUsers;
