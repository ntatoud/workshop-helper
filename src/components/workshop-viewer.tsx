import { usePlateViewEditor } from 'platejs/react'

import { BasicBlocksKitStatic } from '@/components/editor/plugins/basic-blocks-kit/static'
import { EditorStatic } from '@/components/editor/static'

export type WorkshopViewerProps = {
  content: any
}

export function WorkshopViewer({ content }: WorkshopViewerProps) {
  const editor = usePlateViewEditor({
    plugins: [...BasicBlocksKitStatic],
    value: content,
  })

  return <EditorStatic editor={editor} />
}
