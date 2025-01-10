import styled from '@emotion/styled'
import { Button, Flex, SimpleGrid, Stack, Text } from '@mantine/core'
import { useState, useEffect, useRef } from 'react'
import { Editor, Range, Transforms } from 'slate'
import { useSlate, ReactEditor } from 'slate-react'
import useApi from '../../api/useApi'

const Popup = styled.div`
  position: absolute;
  z-index: 1000;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
`

const Rewriter = () => {
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const [isVisible, setIsVisible] = useState(false)
  const popupRef = useRef(null)
  const editorRef = useRef(null)
  const api = useApi()
  const editor = useSlate()

  // Track selection and position popup
  useEffect(() => {
    const updatePopupPosition = () => {
      const selection = editor.selection
      if (!selection || Range.isCollapsed(selection)) {
        setIsVisible(false)
        return
      }

      const domSelection = window.getSelection()
      if (domSelection.rangeCount > 0) {
        const domRange = domSelection.getRangeAt(0)
        const selectionRect = domRange.getBoundingClientRect()
        const editorRect = editorRef.current.getBoundingClientRect()

        const popupWidth = popupRef.current?.offsetWidth || 200

        setPopupPosition({
          top: selectionRect.bottom - editorRect.top + 8, // Relative to editor
          left:
            selectionRect.left -
            editorRect.left +
            selectionRect.width / 2 -
            popupWidth / 2, // Center horizontally
        })
        setIsVisible(true)
      }
    }

    updatePopupPosition()
  }, [editor.selection])

  const onRewriteOptionClick = async (option) => {
    const text = Editor.string(editor, editor.selection)
    const newText = await api.rewriteText(text, option)

    if (!editor.selection) {
      ReactEditor.focus(editor)
    }
    Transforms.select(editor, {
      anchor: Editor.start(editor, []),
      focus: Editor.end(editor, []),
    })
    Transforms.delete(editor)

    Editor.insertText(editor, newText)

    setIsVisible(false) // Hide the popup after selecting an option
  }

  return (
    <div ref={editorRef} style={{ position: 'relative' }}>
      {isVisible && (
        <Popup
          ref={popupRef}
          style={{
            top: `${popupPosition.top}px`,
            left: `${popupPosition.left}px`,
          }}
        >
          <Flex direction="column" gap="sm" justify="center" align="center">
            <Text>Skriv om din text</Text>

            <SimpleGrid cols={2} spacing="md" style={{ padding: '0 16px' }}>
              <Button
                size="xs"
                onClick={() => onRewriteOptionClick('minimal')}
                variant="light"
              >
                Minimalt
              </Button>
              <Button
                size="xs"
                onClick={() => onRewriteOptionClick('formal')}
                variant="light"
              >
                Formellt
              </Button>
              <Button
                size="xs"
                onClick={() => onRewriteOptionClick('casual')}
                variant="light"
              >
                Avslappnat
              </Button>
              <Button
                size="xs"
                onClick={() => onRewriteOptionClick('shorter')}
                variant="light"
              >
                Kortare
              </Button>
              <Button
                size="xs"
                onClick={() => onRewriteOptionClick('longer')}
                variant="light"
              >
                Längre
              </Button>
            </SimpleGrid>
          </Flex>
        </Popup>
      )}
    </div>
  )
}

export default Rewriter
