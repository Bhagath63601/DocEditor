import React from 'react';

const VerticalRuler = ({ topMargin = 96, bottomMargin = 96 }) => {
    // 1 cm ≈ 38px
    const tickSpacing = 38;
    const totalTicks = 300; // Covers ~11400px height (plenty for long documents)

    return (
        <div className="vertical-ruler-wrapper">
            <div className="vertical-ruler-container">
                <div className="vertical-ruler-ticks-container">
                    {Array.from({ length: totalTicks }).map((_, i) => (
                        <div key={i} className="vertical-ruler-tick-group" style={{ top: `${i * tickSpacing}px` }}>
                            <div className="vertical-ruler-tick-major" />
                            {i > 0 && <span className="vertical-ruler-tick-number">{i}</span>}
                            {/* Sub ticks */}
                            <div className="vertical-ruler-sub-ticks">
                                <div className="vertical-ruler-tick-minor" style={{ top: '9.5px', width: '4px' }} />
                                <div className="vertical-ruler-tick-minor" style={{ top: '19px', width: '6px' }} />
                                <div className="vertical-ruler-tick-minor" style={{ top: '28.5px', width: '4px' }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Gray out the margin areas on the vertical ruler */}
                <div className="vertical-ruler-margin-overlay" style={{ top: 0, height: `${topMargin}px` }} />
                {/* 
                  Bottom margin overlay is tricky without knowing the exact document height, 
                  but we can add it to the CSS to align with bottom if needed.
                  Currently the vertical ruler spans the height of the paper container.
                */}
            </div>
        </div>
    );
};

export default VerticalRuler;
