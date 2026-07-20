import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const CommandList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
        return true;
      }

      if (event.key === 'ArrowDown') {
        setSelectedIndex((selectedIndex + 1) % props.items.length);
        return true;
      }

      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  useEffect(() => {
    // Scroll selected item into view if necessary
    const selectedElement = document.querySelector('.slash-menu-item.is-selected');
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  return (
    <div className="slash-menu glass fade-in">
      {props.items.length > 0 ? (
        props.items.map((item, index) => (
          <button
            key={index}
            className={`slash-menu-item ${index === selectedIndex ? 'is-selected' : ''}`}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="slash-menu-icon">
              <item.icon size={18} />
            </div>
            <div className="slash-menu-text">
              <div className="slash-menu-title">{item.title}</div>
              <div className="slash-menu-description">{item.description}</div>
            </div>
          </button>
        ))
      ) : (
        <div className="slash-menu-empty" style={{ padding: '0.8rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No results found
        </div>
      )}
    </div>
  );
});

export default CommandList;
