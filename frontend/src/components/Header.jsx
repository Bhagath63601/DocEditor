import React, { Profiler } from 'react';
import { ArrowLeft, FileText, Cloud, Check, Share2 } from 'lucide-react';
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
        <header className="toolbar" style={{ justifyContent: 'space-between', height: '64px', backgroundColor: 'var(--bg)', borderBottomColor: 'var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                    className="toolbar-btn" 
                    onClick={onNavigateBack}
                    style={{ marginRight: '0.5rem' }}
                >
                    <ArrowLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={18} className="text-primary" />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-muted)' }}>
                        Documents / {docTitle || 'Untitled'}
                    </span>
                </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {saving ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Cloud size={14} className="fade-in" /> Saving...
                        </span>
                    ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Check size={14} color="#10b981" /> Saved
                        </span>
                    )}
                </div>
                
                <Profiler id="ActiveUsers" onRender={logProfile}>
                    <ActiveUsers provider={provider} currentUser={currentUser} />
                </Profiler>

                {showShareButton && (
                    <button className="btn btn-outline" style={{ padding: '0.4rem 0.75rem' }} onClick={onShareClick}>
                        <Share2 size={16} /> Share
                    </button>
                )}
                
                <button className="btn btn-primary" style={{ padding: '0.4rem 1rem' }} onClick={onSaveTitleClick} disabled={saveDisabled}>
                    {saving ? 'Saving...' : 'Save Title'}
                </button>
            </div>
        </header>
    );
});

Header.displayName = 'Header';

export default Header;
