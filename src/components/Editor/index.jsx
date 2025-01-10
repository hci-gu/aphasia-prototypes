import styled from '@emotion/styled'
import { useEffect, useMemo, useState } from 'react'
import { createEditor, Editor, Node, Transforms } from 'slate'
import { Editable, Slate, useSlate, withReact } from 'slate-react'
import { useAtomValue } from 'jotai'
import {
  activeToolAtom,
  selectedEmailAtom,
  TOOL_AUTOCOMPLETE,
  TOOL_AUTOCOMPLETE_ON_KEY,
  TOOL_RESPONSE_BUTTONS,
  TOOL_REWRITER,
} from '../../state'
// import AutoCompleteOnKey from './AutoCompleteOnKey'
import AutoComplete from './AutoComplete'
import Rewriter from './Rewriter'
import ResponseButtons from './ResponseButtons'
import { Button } from '@mantine/core'
import { IconMail } from '@tabler/icons-react'

const INITAL_EDITOR_VALUE = [
  {
    children: [{ text: '' }],
  },
]

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
  width: 60vw;

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

const heightForTool = (tool) => {
  switch (tool) {
    // case TOOL_REWRITER:
    //   return '140px'
    // case TOOL_RESPONSE_BUTTONS:
    //   return '140px'
    default:
      return '200px'
  }
}

const SelectAllTextButton = () => {
  const editor = useSlate()
  return (
    <Button
      variant="light"
      onClick={() => {
        // select all text
        Transforms.select(editor, {
          anchor: Editor.start(editor, []),
          focus: Editor.end(editor, []),
        })
        setTimeout(() => {
          ReactEditor.focus(editor)
        }, 0)
      }}
      style={{
        position: 'absolute',
        bottom: 12,
        left: 138,
      }}
    >
      Markera text
    </Button>
  )
}

const ClearOnEmailChange = () => {
  const editor = useSlate()
  const selectedEmail = useAtomValue(selectedEmailAtom)
  const [email, setEmail] = useState(selectedEmail)

  useEffect(() => {
    if (selectedEmail !== email) {
      setEmail(selectedEmail)
      Editor.withoutNormalizing(editor, () => {
        Transforms.delete(editor, {
          at: {
            anchor: Editor.start(editor, []),
            focus: Editor.end(editor, []),
          },
        })
      })
    }
  }, [email, selectedEmail])
}

const CustomEditor = ({ onActionClick = () => {} }) => {
  const editor = useMemo(() => withReact(createEditor()), [])
  const activeTool = useAtomValue(activeToolAtom)

  return (
    <Root>
      <EditorWrapper
        style={{
          minHeight: heightForTool(activeTool),
        }}
      >
        <Slate editor={editor} initialValue={INITAL_EDITOR_VALUE}>
          {/* {(activeTool == TOOL_AUTOCOMPLETE ||
            activeTool == TOOL_AUTOCOMPLETE_ON_KEY) && (
            )} */}
          <ClearOnEmailChange />
          <AutoComplete type={TOOL_AUTOCOMPLETE} />
          <Rewriter editor={editor} />
          <Editable
            style={{
              height: '100%',
              outline: 'none', // Remove default input styling
              border: 'none', // Remove default input border
              padding: 0, // Remove default input padding
              paddingBottom: 48,
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
          <SelectAllTextButton />
        </Slate>
        <Button
          onClick={() => {
            const editorText = editor.children
              .map((node) => Node.string(node))
              .join('\n')
            onActionClick(editorText)
            // Clear the editor
            Editor.withoutNormalizing(editor, () => {
              Transforms.delete(editor, {
                at: {
                  anchor: Editor.start(editor, []),
                  focus: Editor.end(editor, []),
                },
              })
            })
          }}
          style={{
            position: 'absolute',
            bottom: 12,
            left: 12,
          }}
        >
          <IconMail
            size={24}
            style={{
              marginRight: 8,
            }}
          />
          Skicka
        </Button>
      </EditorWrapper>
      <ResponseButtons editor={editor} />
    </Root>
  )
}

export default CustomEditor
