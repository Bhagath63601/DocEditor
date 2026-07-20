import React, { useEffect, useMemo } from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import FontFamily from '@tiptap/extension-font-family';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';

import SlashCommands from '../extensions/SlashCommands';
import suggestion from '../extensions/suggestion';
import FontSize from '../extensions/FontSize';

import Editor from './Editor';

const EditorContainer = React.memo(({ id, role, ydoc, provider, userInfo, onEditorReady }) => {
    console.log('[PROFILER] EditorContainer rendered');

    const extensions = useMemo(() => {
        console.log('[DEBUG] Re-calculating extensions in EditorContainer');
        return [
            StarterKit.configure({
                history: false, // Collaboration handles history
            }),
            Collaboration.configure({
                document: ydoc,
            }),
            CollaborationCursor.configure({
                provider: provider,
                user: {
                    name: userInfo.name,
                    color: userInfo.color,
                    avatar: userInfo.avatar,
                    id: userInfo.id
                },
                render(user) {
                    const caret = document.createElement('span');
                    caret.classList.add('collaboration-cursor__caret');
                    caret.style.borderColor = user.color;
                    
                    const pill = document.createElement('span');
                    pill.classList.add('collaboration-cursor__pill');
                    pill.style.setProperty('--pill-color', user.color);
                    
                    if (user.isTyping) {
                        pill.classList.add('typing');
                    }
                    
                    // Add status dot
                    const dot = document.createElement('span');
                    dot.classList.add('collaboration-cursor__dot');
                    pill.appendChild(dot);
                    
                    // Add text node for the username
                    const text = document.createTextNode(user.name || 'Anonymous');
                    pill.appendChild(text);
                    
                    caret.appendChild(pill);
                    return caret;
                }
            }),
            Underline,
            FontFamily,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            Placeholder.configure({
                placeholder: 'Start writing your document...',
            }),
            SlashCommands.configure({
                suggestion,
            }),
        ];
    }, [ydoc, provider, userInfo]);

    const editor = useEditor({
        extensions,
        editable: role !== 'viewer',
    }, [id]); // Recreate editor ONLY when document ID changes

    // Set editable status when role changes
    useEffect(() => {
        if (editor) {
            const isEditable = role !== 'viewer';
            if (editor.isEditable !== isEditable) {
                editor.setEditable(isEditable);
            }
        }
    }, [editor, role]);

    // Send editor to parent
    useEffect(() => {
        if (editor) {
            onEditorReady(editor);
        }
    }, [editor, onEditorReady]);

    // Sync user details update
    useEffect(() => {
        if (editor && userInfo && userInfo.id) {
            editor.commands.updateUser({
                name: userInfo.name,
                color: userInfo.color,
                avatar: userInfo.avatar,
                id: userInfo.id
            });
        }
    }, [editor, userInfo]);

    // Sync typing status with Yjs awareness
    useEffect(() => {
        if (!editor || !provider) return;

        let typingTimeout = null;

        const handleUpdate = ({ transaction }) => {
            // Only update typing status if the document actually changed (typing/deleting)
            if (!transaction.docChanged) return;

            const localState = provider.awareness.getLocalState();
            if (localState?.user) {
                // If they weren't already marked as typing, set isTyping: true
                if (!localState.user.isTyping) {
                    provider.awareness.setLocalStateField("user", {
                        ...localState.user,
                        isTyping: true
                    });
                }

                // Reset the inactivity timeout
                if (typingTimeout) {
                    clearTimeout(typingTimeout);
                }

                typingTimeout = setTimeout(() => {
                    const latestState = provider.awareness.getLocalState();
                    if (latestState?.user && latestState.user.isTyping) {
                        provider.awareness.setLocalStateField("user", {
                            ...latestState.user,
                            isTyping: false
                        });
                    }
                }, 3000);
            }
        };

        editor.on('update', handleUpdate);

        return () => {
            editor.off('update', handleUpdate);
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        };
    }, [editor, provider]);

    return <Editor editor={editor} />;
});

EditorContainer.displayName = 'EditorContainer';

export default EditorContainer;
