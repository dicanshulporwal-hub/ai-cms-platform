'use client';

import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  UnderlineIcon,
} from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface TiptapEditorProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string;
}

export function TiptapEditor({
  disabled = false,
  onChange,
  value,
}: TiptapEditorProps) {
  const editor = useEditor({
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class:
          'cms-editor-content min-h-[280px] rounded-b-md border-x border-b border-border bg-card px-4 py-3 text-sm outline-none',
      },
    },
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      Image,
    ],
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <div className="min-h-[320px] rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
        Loading editor
      </div>
    );
  }

  function setLink() {
    if (!editor) {
      return;
    }

    const currentUrl = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Enter link URL', currentUrl ?? '');

    if (url === null) {
      return;
    }

    if (!url.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run();
  }

  function insertImage() {
    if (!editor) {
      return;
    }

    const url = window.prompt('Enter image URL');

    if (!url?.trim()) {
      return;
    }

    editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  const toolbarItems = [
    {
      active: editor.isActive('bold'),
      icon: Bold,
      label: 'Bold',
      onClick: () => editor.chain().focus().toggleBold().run(),
    },
    {
      active: editor.isActive('italic'),
      icon: Italic,
      label: 'Italic',
      onClick: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      active: editor.isActive('underline'),
      icon: UnderlineIcon,
      label: 'Underline',
      onClick: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      active: editor.isActive('heading', { level: 1 }),
      icon: Heading1,
      label: 'Heading 1',
      onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
    },
    {
      active: editor.isActive('heading', { level: 2 }),
      icon: Heading2,
      label: 'Heading 2',
      onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
    },
    {
      active: editor.isActive('heading', { level: 3 }),
      icon: Heading3,
      label: 'Heading 3',
      onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
    },
    {
      active: editor.isActive('bulletList'),
      icon: List,
      label: 'Bullet list',
      onClick: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      active: editor.isActive('orderedList'),
      icon: ListOrdered,
      label: 'Numbered list',
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      active: editor.isActive('blockquote'),
      icon: Quote,
      label: 'Blockquote',
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
    },
    {
      active: editor.isActive('link'),
      icon: LinkIcon,
      label: 'Link',
      onClick: setLink,
    },
    {
      active: false,
      icon: ImageIcon,
      label: 'Insert image',
      onClick: insertImage,
    },
    {
      active: false,
      icon: Undo2,
      label: 'Undo',
      onClick: () => editor.chain().focus().undo().run(),
    },
    {
      active: false,
      icon: Redo2,
      label: 'Redo',
      onClick: () => editor.chain().focus().redo().run(),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap gap-1 rounded-t-md border border-border bg-muted p-2">
        {toolbarItems.map((item) => {
          const Icon = item.icon;

          return (
            <Button
              aria-label={item.label}
              className="h-9 w-9 px-0"
              disabled={disabled}
              key={item.label}
              onClick={item.onClick}
              title={item.label}
              type="button"
              variant={item.active ? 'default' : 'outline'}
            >
              <Icon className="h-4 w-4" />
            </Button>
          );
        })}
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
