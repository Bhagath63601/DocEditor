import React, { useRef, useState, useEffect } from 'react';

const Ruler = React.memo(({ margins, setMargins }) => {
    console.log('[PROFILER] Ruler rendered');
    const rulerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(null); // 'left' or 'right'

    // 1 cm ≈ 38px
    const tickSpacing = 38;
    const totalTicks = 25; // Ensures it covers 850px comfortably

    const handlePointerDown = (e, side) => {
        e.preventDefault();
        setIsDragging(side);
        // Change cursor for entire window while dragging
        document.body.style.cursor = 'ew-resize';
    };

    const handlePointerUp = () => {
        setIsDragging(null);
        document.body.style.cursor = '';
    };

    const handlePointerMove = (e) => {
        if (!isDragging || !rulerRef.current) return;
        
        const rect = rulerRef.current.getBoundingClientRect();
        // Calculate raw x position inside ruler
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        
        // Prevent overlapping margins (keep minimum 100px text area)
        if (isDragging === 'left') {
            const newLeft = Math.min(x, rect.width - margins.right - 100);
            setMargins(prev => ({ ...prev, left: newLeft }));
        } else if (isDragging === 'right') {
            const distFromRight = rect.width - x;
            const newRight = Math.min(distFromRight, rect.width - margins.left - 100);
            setMargins(prev => ({ ...prev, right: newRight }));
        }
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('pointerup', handlePointerUp);
            window.addEventListener('pointermove', handlePointerMove);
        }
        return () => {
            window.removeEventListener('pointerup', handlePointerUp);
            window.removeEventListener('pointermove', handlePointerMove);
            document.body.style.cursor = ''; // cleanup just in case
        };
    }, [isDragging, margins]);

    return (
        <div className="ruler-wrapper">
            <div className="ruler-container" ref={rulerRef}>
                <div className="ruler-ticks-container">
                    {Array.from({ length: totalTicks }).map((_, i) => (
                        <div key={i} className="ruler-tick-group" style={{ left: `${i * tickSpacing}px` }}>
                            <div className="ruler-tick-major" />
                            {i > 0 && <span className="ruler-tick-number">{i}</span>}
                            {/* Sub ticks for halves and quarters */}
                            <div className="ruler-sub-ticks">
                                <div className="ruler-tick-minor" style={{ left: '9.5px', height: '4px' }} />
                                <div className="ruler-tick-minor" style={{ left: '19px', height: '6px' }} />
                                <div className="ruler-tick-minor" style={{ left: '28.5px', height: '4px' }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gray out the margin areas on the ruler */}
                <div className="ruler-margin-overlay" style={{ left: 0, width: `${margins.left}px` }} />
                <div className="ruler-margin-overlay" style={{ right: 0, width: `${margins.right}px` }} />

                {/* Left Margin Handle */}
                <div 
                    className={`ruler-handle ruler-handle-left ${isDragging === 'left' ? 'dragging' : ''}`}
                    style={{ left: `${margins.left}px` }}
                    onPointerDown={(e) => handlePointerDown(e, 'left')}
                    title="Left Margin"
                >
                    <div className="ruler-handle-hitbox">
                        <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="12" height="5" fill="currentColor" />
                            <path d="M0 7H12L6 18L0 7Z" fill="currentColor" />
                        </svg>
                    </div>
                    {/* Vertical guideline when dragging */}
                    {isDragging === 'left' && <div className="ruler-guideline" />}
                </div>

                {/* Right Margin Handle */}
                <div 
                    className={`ruler-handle ruler-handle-right ${isDragging === 'right' ? 'dragging' : ''}`}
                    style={{ right: `${margins.right}px` }}
                    onPointerDown={(e) => handlePointerDown(e, 'right')}
                    title="Right Margin"
                >
                    <div className="ruler-handle-hitbox">
                        <svg width="12" height="18" viewBox="0 0 12 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="12" height="5" fill="currentColor" />
                            <path d="M0 7H12L6 18L0 7Z" fill="currentColor" />
                        </svg>
                    </div>
                    {/* Vertical guideline when dragging */}
                    {isDragging === 'right' && <div className="ruler-guideline" />}
                </div>
            </div>
        </div>
    );
});

Ruler.displayName = 'Ruler';

export default Ruler;

