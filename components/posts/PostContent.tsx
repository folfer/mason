'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import { useEffect } from 'react'

interface PostContentProps {
  content: object
}

export function PostContent({ content }: PostContentProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: true }),
    ],
    content,
    editable: false,
    immediatelyRender: false,
  })

  useEffect(() => {
    if (editor && content) {
      editor.commands.setContent(content)
    }
  }, [editor, content])

  return (
    <div className="post-content">
      <EditorContent editor={editor} />
    </div>
  )
}
