import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, RotateCcw } from 'lucide-react';

const ColorPicker = ({ color, onChange, onClose }) => {
  const [hex, setHex] = useState(color || '#000000');
  
  useEffect(() => {
    if (color && color !== hex) {
      setHex(color);
    }
  }, [color]);
  const [customColors, setCustomColors] = useState(['#ff0000', '#00ff00', '#0000ff']);
  
  const basicColors = [
    '#f87171', '#ef4444', '#b91c1c', '#7f1d1d',
    '#fb923c', '#f97316', '#c2410c', '#7c2d12',
    '#facc15', '#eab308', '#a16207', '#713f12',
    '#4ade80', '#22c55e', '#15803d', '#064e3b',
    '#2dd4bf', '#14b8a6', '#0f766e', '#134e4a',
    '#38bdf8', '#0ea5e9', '#0369a1', '#0c4a6e',
    '#818cf8', '#6366f1', '#4338ca', '#312e81',
    '#c084fc', '#a855f7', '#7e22ce', '#581c87',
    '#f472b6', '#ec4899', '#be185d', '#831843',
    '#94a3b8', '#64748b', '#334155', '#0f172a',
    '#ffffff', '#000000'
  ];

  const handleHexChange = (e) => {
    let val = e.target.value;
    if (!val.startsWith('#')) val = '#' + val;
    setHex(val);
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      onChange(val);
    }
  };

  const handleAddCustom = () => {
    if (!customColors.includes(hex)) {
      setCustomColors([hex, ...customColors.slice(0, 7)]);
    }
  };

  return (
    <div className="color-picker-dropdown glass fade-in" onClick={(e) => e.stopPropagation()}>
      <div className="color-picker-header">
        <span>Edit colours</span>
        <button className="close-btn" onClick={onClose}><X size={14} /></button>
      </div>

      <div className="picker-main">
        {/* Spectrum Placeholder - In a real prod app we'd use a gradient field here */}
        <div 
          className="color-preview-large" 
          style={{ backgroundColor: hex }}
        />
        
        <div className="color-controls">
          <div className="input-group">
            <input 
              type="text" 
              value={hex} 
              onChange={handleHexChange}
              className="hex-input"
            />
          </div>
          
          <div className="rgb-controls">
            {/* Simple RGB display/input */}
            <div className="rgb-row">
              <span className="rgb-label">Hex</span>
              <div className="rgb-val">#</div>
            </div>
          </div>
        </div>
      </div>

      <div className="palette-section">
        <div className="palette-title">Basic colours</div>
        <div className="color-grid">
          {basicColors.map((c, i) => (
            <button
              key={i}
              className={`color-swatch ${hex === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => { setHex(c); onChange(c); }}
            />
          ))}
        </div>
      </div>

      <div className="palette-section">
        <div className="palette-header">
          <div className="palette-title">Customised colours</div>
          <button className="add-color-btn" onClick={handleAddCustom}><Plus size={14} /></button>
        </div>
        <div className="color-grid custom">
          {customColors.map((c, i) => (
            <button
              key={i}
              className={`color-swatch ${hex === c ? 'active' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => { setHex(c); onChange(c); }}
            />
          ))}
          {Array(8 - customColors.length).fill(0).map((_, i) => (
            <div key={i} className="color-swatch empty" />
          ))}
        </div>
      </div>

      <div className="color-picker-footer">
        <button 
          className="reset-color-btn" 
          onClick={() => { setHex('#000000'); onChange('#000000'); }}
        >
          <RotateCcw size={12} /> Reset to default
        </button>
      </div>
    </div>
  );
};

export default ColorPicker;
