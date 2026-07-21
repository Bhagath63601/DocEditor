import React, { Profiler } from 'react';
import { ArrowLeft, FileText, Cloud, Check, Share2, ChevronDown } from 'lucide-react';
import ActiveUsers from './ActiveUsers';

const Header = React.memo(({ 
    docTitle, 
    onNavigateBack, 
    saving, 
    provider, 
    currentUser, 
    showShareButton, 
    onShareClick, 
    onSaveTitleClick, 
    saveDisabled 
}) => {
    console.log('[PROFILER] Header rendered');

    const logProfile = (id, phase, actualDuration) => {
        console.log(`[PROFILER] ${id} (${phase}): ${actualDuration.toFixed(2)}ms`);
    };

    return (
        <header className="toolbar" style={{ justifyContent: 'space-between', height: '64px', backgroundColor: '#090d1f', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <button 
                    className="toolbar-btn" 
                    onClick={onNavigateBack}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#2563eb', borderRadius: '8px', color: 'white', boxShadow: '0 0 12px rgba(37,99,235,0.5)' }}>
                        <FileText size={18} />
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'Outfit', sans-serif" }}>
                        {docTitle || 'Untitled'} <ChevronDown size={16} style={{ color: '#8c9ba5', cursor: 'pointer' }} />
                    </span>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', fontWeight: '500' }}>
                    {saving ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Cloud size={14} className="fade-in" /> Saving...
                        </span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <Check size={14} color="#00f2fe" style={{ filter: 'drop-shadow(0 0 4px rgba(0, 242, 254, 0.5))' }} /> Saved
                        </span>
                    )}
                </div>
                
                <Profiler id="ActiveUsers" onRender={logProfile}>
                    <ActiveUsers provider={provider} currentUser={currentUser} />
                </Profiler>
 
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {showShareButton && (
                        <button className="btn header-share-btn" style={{ padding: '0.5rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '0.5rem', fontSize: '0.875rem' }} onClick={onShareClick}>
                            <Share2 size={16} /> Share
                        </button>
                    )}
                    
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1.15rem', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem', background: 'rgba(255, 255, 255, 0.02)' }} onClick={onSaveTitleClick} disabled={saveDisabled}>
                        {saving ? 'Saving...' : 'Save Title'}
                    </button>
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';

export default Header;
