import React, { useState, useEffect, useRef } from 'react';

const TitleInput = React.memo(({ initialTitle, onSave, disabled }) => {
    console.log('[PROFILER] TitleInput rendered');
    const [title, setTitle] = useState(initialTitle || '');
    const isFocusedRef = useRef(false);
    const saveTimeoutRef = useRef(null);

    // Sync from parent only when not focused
    useEffect(() => {
        if (!isFocusedRef.current) {
            setTitle(initialTitle || '');
        }
    }, [initialTitle]);

    const handleChange = (e) => {
        const newTitle = e.target.value;
        setTitle(newTitle);

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(() => {
            onSave(newTitle);
        }, 800); // 800ms debounce
    };

    const handleFocus = () => {
        isFocusedRef.current = true;
    };

    const handleBlur = () => {
        isFocusedRef.current = false;
        // Immediate save on blur
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        onSave(title);
    };

    useEffect(() => {
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [title, onSave]);

    return (
        <input
            className="doc-title-editor"
            value={title}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Untitled Document"
            disabled={disabled}
        />
    );
});

TitleInput.displayName = 'TitleInput';

export default TitleInput;
