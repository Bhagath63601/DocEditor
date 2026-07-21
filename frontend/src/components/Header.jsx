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
        <header className="toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px', backgroundColor: '#090d1f', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: 0, flexShrink: 1 }}>
                <button 
                    className="toolbar-btn" 
                    onClick={onNavigateBack}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: '#2563eb', borderRadius: '8px', color: 'white', boxShadow: '0 0 12px rgba(37,99,235,0.5)', flexShrink: 0 }}>
                        <FileText size={18} />
                    </div>
                    <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: "'Outfit', sans-serif", minWidth: 0 }}>
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>
                            {docTitle || 'Untitled'}
                        </span>
                        <ChevronDown size={16} style={{ color: '#8c9ba5', cursor: 'pointer', flexShrink: 0 }} />
                    </span>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem', fontWeight: '500', flexShrink: 0, whiteSpace: 'nowrap' }}>
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
 
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    {showShareButton && (
                        <button className="btn header-share-btn" style={{ padding: '0.5rem 1.15rem', display: 'flex', alignItems: 'center', gap: '0.4rem', borderRadius: '0.5rem', fontSize: '0.875rem', flexShrink: 0 }} onClick={onShareClick}>
                            <Share2 size={16} /> Share
                        </button>
                    )}
                    
                    <button className="btn btn-outline" style={{ padding: '0.5rem 1.15rem', border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.875rem', background: 'rgba(255, 255, 255, 0.02)', flexShrink: 0 }} onClick={onSaveTitleClick} disabled={saveDisabled}>
                        {saving ? 'Saving...' : 'Save Title'}
                    </button>
                </div>
            </div>
        </header>
    );
});

Header.displayName = 'Header';

export default Header;
