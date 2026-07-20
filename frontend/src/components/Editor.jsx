import React from 'react';
import { EditorContent } from '@tiptap/react';

const Editor = ({ editor }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-root">
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
};

export default Editor;

