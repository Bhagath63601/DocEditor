import React, { useState, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, Code, 
  List, ListOrdered, Quote, Undo, Redo, Type,
  AlignLeft, AlignCenter, AlignRight, Highlighter, Palette,
  Heading1, Heading2, Heading3, Pilcrow, ChevronDown, Check
} from 'lucide-react';
import ColorPicker from './ColorPicker';

const Toolbar = React.memo(({ editor }) => {
  console.log('[PROFILER] Toolbar rendered');

  const [activePicker, setActivePicker] = useState(null); // 'text' or 'highlight'
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [, setTick] = useState(0);

  // Throttle toolbar updates to once per animation frame on editor events
  useEffect(() => {
    if (!editor) return;

    let rAFId = null;
    const handleUpdate = () => {
      if (rAFId) return;
      rAFId = requestAnimationFrame(() => {
        setTick(t => t + 1);
        rAFId = null;
      });
    };

    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
      if (rAFId) {
        cancelAnimationFrame(rAFId);
      }
    };
  }, [editor]);

  if (!editor) return null;

  const fontSizes = [
    { label: '8', value: '8px' },
    { label: '10', value: '10px' },
    { label: '12', value: '12px' },
    { label: '14', value: '14px' },
    { label: '16', value: '16px' },
    { label: '18', value: '18px' },
    { label: '24', value: '24px' },
    { label: '30', value: '30px' },
    { label: '36', value: '36px' },
    { label: '48', value: '48px' },
    { label: '60', value: '60px' },
    { label: '72', value: '72px' },
  ];

  const ToolbarGroup = ({ children }) => (
    <div className="toolbar-group">
      {children}
    </div>
  );

  const TooltipButton = ({ onClick, isActive, disabled, children, title, icon: Icon, size = 18 }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`toolbar-btn ${isActive ? 'is-active' : ''}`}
      title={title}
    >
      {Icon ? <Icon size={size} /> : children}
    </button>
  );

  return (
    <div className="toolbar-container glass">
      <div className="toolbar-inner">
        {/* History Group */}
        <ToolbarGroup>
          <TooltipButton 
            onClick={() => editor.chain().focus().undo().run()} 
            disabled={!editor.can().undo()} 
            title="Undo (Ctrl+Z)" 
            icon={Undo} 
          />
          <TooltipButton 
            onClick={() => editor.chain().focus().redo().run()} 
            disabled={!editor.can().redo()} 
            title="Redo (Ctrl+Y)" 
            icon={Redo} 
          />
        </ToolbarGroup>

        <div className="divider" />

        {/* Font Family Dropdown */}
        <div className="toolbar-group" style={{ position: 'relative' }}>
          <button 
            className="toolbar-btn" 
            style={{ width: '130px', justifyContent: 'space-between', padding: '0 0.5rem', gap: '0.25rem' }}
            onClick={() => setShowFontDropdown(!showFontDropdown)}
          >
            <span style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {editor.getAttributes('textStyle').fontFamily || 'Arial'}
            </span>
            <ChevronDown size={14} />
          </button>
          
          {showFontDropdown && (
            <div className="glass fade-in" style={{ 
              position: 'absolute', top: '100%', left: 0, zIndex: 1000, 
              background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
              marginTop: '0.5rem', width: '200px', maxHeight: '350px', overflowY: 'auto',
              padding: '6px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
              {[
                'Arial', 'Caveat', 'Comfortaa', 'Comic Sans MS', 'Courier New', 
                'EB Garamond', 'Georgia', 'Impact', 'Lexend', 'Lobster', 
                'Lora', 'Merriweather', 'Montserrat', 'Nunito', 'Oswald', 'Pacifico'
              ].map(font => (
                <button
                  key={font}
                  style={{ 
                    display: 'flex', width: '100%', padding: '0.6rem 0.8rem', 
                    background: editor.getAttributes('textStyle').fontFamily === font ? 'rgba(59, 130, 246, 0.1)' : 'transparent', 
                    border: 'none', color: editor.getAttributes('textStyle').fontFamily === font ? '#3b82f6' : '#eee',
                    fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left',
                    fontFamily: font, borderRadius: '6px', marginBottom: '2px'
                  }}
                  onClick={() => {
                    editor.chain().focus().setFontFamily(font).run();
                    setShowFontDropdown(false);
                  }}
                >
                  <span style={{ flex: 1 }}>{font}</span>
                  {editor.getAttributes('textStyle').fontFamily === font && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="divider" />

        {/* Text Style Group */}
        <ToolbarGroup>
          <select 
            className="toolbar-select"
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'p') editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: parseInt(val) }).run();
            }}
            value={
              editor.isActive('heading', { level: 1 }) ? '1' :
              editor.isActive('heading', { level: 2 }) ? '2' :
              editor.isActive('heading', { level: 3 }) ? '3' : 'p'
            }
          >
            <option value="p">Normal text</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
          </select>

          <select 
            className="toolbar-select font-size-select"
            onChange={(e) => editor.chain().focus().setFontSize(e.target.value).run()}
            value={editor.getAttributes('textStyle').fontSize || '16px'}
          >
            {fontSizes.map(size => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
        </ToolbarGroup>

        {/* Formatting Group */}
        <ToolbarGroup>
          <TooltipButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
            icon={Bold}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
            icon={Italic}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="Underline (Ctrl+U)"
            icon={Underline}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="Strikethrough"
            icon={Strikethrough}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive('code')}
            title="Code"
            icon={Code}
          />
        </ToolbarGroup>

        {/* Color Group */}
        <ToolbarGroup>
          <div className="picker-wrapper">
            <button 
              className={`toolbar-btn ${activePicker === 'text' ? 'is-active' : ''}`}
              title="Text Color"
              onClick={() => setActivePicker(activePicker === 'text' ? null : 'text')}
            >
              <Palette size={18} style={{ color: editor.getAttributes('textStyle').color || 'inherit' }} />
            </button>
            {activePicker === 'text' && (
              <ColorPicker 
                color={editor.getAttributes('textStyle').color} 
                onChange={(c) => editor.chain().focus().setColor(c).run()}
                onClose={() => setActivePicker(null)}
              />
            )}
          </div>

          <div className="picker-wrapper">
            <button 
              className={`toolbar-btn ${editor.isActive('highlight') || activePicker === 'highlight' ? 'is-active' : ''}`}
              title="Highlight Color"
              onClick={() => setActivePicker(activePicker === 'highlight' ? null : 'highlight')}
            >
              <Highlighter size={18} />
            </button>
            {activePicker === 'highlight' && (
              <ColorPicker 
                color={editor.getAttributes('highlight').color} 
                onChange={(c) => editor.chain().focus().setHighlight({ color: c }).run()}
                onClose={() => setActivePicker(null)}
              />
            )}
          </div>
        </ToolbarGroup>

        {/* Alignment Group */}
        <ToolbarGroup>
          <TooltipButton
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            title="Align Left"
            icon={AlignLeft}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            title="Align Center"
            icon={AlignCenter}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            title="Align Right"
            icon={AlignRight}
          />
        </ToolbarGroup>

        {/* List Group */}
        <ToolbarGroup>
          <TooltipButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="Bullet List"
            icon={List}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="Ordered List"
            icon={ListOrdered}
          />
          <TooltipButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="Blockquote"
            icon={Quote}
          />
        </ToolbarGroup>
      </div>
    </div>
  );
});

Toolbar.displayName = 'Toolbar';

export default Toolbar;

