import { Plate, usePlateEditor } from 'platejs/react'

import { Editor, EditorContainer } from '@/components/editor'
import { BasicBlocksKit } from '@/components/editor/plugins/basic-blocks-kit'

export function WorkshopEditor() {
  const editor = usePlateEditor({
    plugins: [...BasicBlocksKit],
  })

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor />
      </EditorContainer>
    </Plate>
  )
}
