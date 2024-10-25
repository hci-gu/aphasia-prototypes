import styled from '@emotion/styled'
import { useMemo } from 'react'
import { createEditor, Editor } from 'slate'
import { Editable, Slate, withReact } from 'slate-react'
import { useAtomValue } from 'jotai'
import { activeToolAtom, TOOL_AUTOCOMPLETE, TOOL_REWRITER } from '../../state'
import AutoComplete from './AutoComplete'
import Rewriter from './Rewriter'

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }
  if (leaf.italic) {
    children = <em>{children}</em>
  }
  if (leaf.underlined) {
    children = <u>{children}</u>
  }
  return <span {...attributes}>{children}</span>
}
const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
}
const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)
  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
}

const Root = styled.div`
  margin: 0 auto;
  width: 80vw;

  display: flex;
  flex-direction: column;
  gap: 16px;
`

const EditorWrapper = styled.div`
  position: relative;
  width: 100%;
  min-height: 400px;
  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 16px;
`

const CustomEditor = () => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const activeTool = useAtomValue(activeToolAtom)

  return (
    <Root>
      <EditorWrapper
        style={{
          minHeight: activeTool == TOOL_REWRITER ? '140px' : '400px',
        }}
      >
        <Slate
          editor={editor}
          initialValue={[
            {
              children: [{ text: '' }],
            },
          ]}
        >
          {activeTool == TOOL_AUTOCOMPLETE && <AutoComplete />}
          <Editable
            style={{
              height: '100%',
              outline: 'none', // Remove default input styling
              border: 'none', // Remove default input border
              padding: 0, // Remove default input padding
              margin: 0, // Remove default input margin
            }}
            renderLeaf={(props) => <Leaf {...props} />}
            placeholder="Skriv något här..."
            onDOMBeforeInput={(event) => {
              switch (event.inputType) {
                case 'formatBold':
                  event.preventDefault()
                  return toggleMark(editor, 'bold')
                case 'formatItalic':
                  event.preventDefault()
                  return toggleMark(editor, 'italic')
                case 'formatUnderline':
                  event.preventDefault()
                  return toggleMark(editor, 'underlined')
              }
            }}
            onChange={(newValue) => {
              console.log(newValue)
            }}
          />
        </Slate>
      </EditorWrapper>
      {activeTool == TOOL_REWRITER && <Rewriter editor={editor} />}
    </Root>
  )
}

export default CustomEditor
