import ReactDOM from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { Editor } from 'slate'
import { useFocused, useSlate } from 'slate-react'
import { Button, Flex, Loader } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import useApi from '../../api/useApi'

const Popup = styled.div`
  /* padding: 8px 7px 6px; */
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -12px;
  opacity: 0;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: opacity 0.75s;
`

const Portal = ({ children }) => {
  return typeof document === 'object'
    ? ReactDOM.createPortal(children, document.body)
    : null
}

const AutoCompleteOnKey = () => {
  const ref = useRef()
  const editor = useSlate()
  const inFocus = useFocused()
  const [loading, setLoading] = useState(true)
  const [suggestedWords, setSuggestedWords] = useState(null)
  const api = useApi()

  const editorState = Editor.string(editor, [])

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Tab') {
        // Change "Tab" to any desired key
        event.preventDefault()
        triggerSuggestions()
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [editorState, inFocus])

  // Clear suggestions if editorState changes and suggestions are open
  useEffect(() => {
    if (suggestedWords && suggestedWords.state !== editorState) {
      setSuggestedWords(null)
    }
  }, [editorState, suggestedWords])

  const triggerSuggestions = async () => {
    if (!inFocus || !editor.selection || editorState.length < 5) return

    setLoading(true)
    const words = await api.suggestNextWords(editorState)
    setSuggestedWords({ words, state: editorState })
    setLoading(false)
  }

  useEffect(() => {
    const el = ref.current
    if (!el || !inFocus || !editor.selection) return

    const domSelection = window.getSelection()
    if (domSelection.rangeCount > 0) {
      const domRange = domSelection.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()

      // Center the popup over the cursor
      const popupHeight = el.offsetHeight
      const popupWidth = el.offsetWidth
      el.style.opacity = '1'
      el.style.top = `${rect.bottom + window.pageYOffset - 76}px` // Adjust distance below the cursor
      el.style.left = `${
        rect.left + window.pageXOffset - popupWidth / 2 + rect.width / 2
      }px`
    }
  }, [editorState, inFocus, editor.selection])

  const onClick = (index) => {
    if (suggestedWords) {
      const word = suggestedWords.words[index]
      Editor.insertText(editor, `${word} `)
      setSuggestedWords(null)
    }
  }

  const onRefresh = async () => {
    if (suggestedWords) {
      const currentWords = suggestedWords.words
      setSuggestedWords(null)
      setLoading(true)
      const words = await api.getCompletion(editorState)
      setSuggestedWords({ words, state: editorState })
      setLoading(false)
    }
  }

  return (
    <Portal>
      <Popup
        ref={ref}
        onMouseDown={(e) => e.preventDefault()}
        style={{
          opacity: !loading && !suggestedWords ? 0 : 1,
        }}
      >
        {loading && (
          <div style={{ width: 44, height: 44, padding: 4 }}>
            <Loader w={32} />
          </div>
        )}
        {suggestedWords && (
          <div style={{ position: 'relative', padding: 8 }}>
            <Button
              p={4}
              radius={100}
              style={{
                position: 'absolute',
                right: -24,
                top: -24,
              }}
              disabled={loading}
              onClick={onRefresh}
            >
              <IconRefresh />
            </Button>
            <Flex gap={4}>
              {suggestedWords.words.map((word, index) => (
                <Button key={word} onClick={() => onClick(index)}>
                  {word}
                </Button>
              ))}
            </Flex>
          </div>
        )}
      </Popup>
    </Portal>
  )
}

export default AutoCompleteOnKey
