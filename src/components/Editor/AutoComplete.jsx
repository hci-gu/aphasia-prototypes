import ReactDOM from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { Editor, Range } from 'slate'
import { useFocused, useSlate } from 'slate-react'
import { Button, Flex, Loader } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { useControls } from 'leva'

import useApi from '../../api/useApi'
import {
  TOOL_AUTOCOMPLETE,
  TOOL_AUTOCOMPLETE_ON_KEY,
  toolSettingsAtom,
} from '../../state'
import { useAtomValue } from 'jotai'

const Popup = styled.div`
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

const WordButton = ({ word, onClick, editorState }) => {
  let text = word

  const isWritingStartOfWord =
    !editorState.endsWith(' ') && !editorState.endsWith('.')

  let partOfLastWord = ''
  if (isWritingStartOfWord) {
    const lastWord = editorState.split(' ').slice(-1)[0]
    partOfLastWord = lastWord.slice(0, -1)
  }

  return (
    <Button onClick={onClick}>
      {isWritingStartOfWord && (
        <strong>{editorState.split(' ').slice(-1)[0]}</strong>
      )}
      <span style={{ fontWeight: isWritingStartOfWord ? 'lighter' : 'bold' }}>
        {word}
      </span>
    </Button>
  )
}

const AutoComplete = ({ type }) => {
  const { autoCompleteDelay } = useAtomValue(toolSettingsAtom)
  const ref = useRef()
  const editor = useSlate()
  const inFocus = useFocused()
  const [loading, setLoading] = useState(false)
  const [suggestedWords, setSuggestedWords] = useState(null)
  const api = useApi()

  const editorState = Editor.string(editor, [])

  const [debouncedEditorState, setDebouncedEditorState] = useState(editorState)

  useEffect(() => {
    if (type !== TOOL_AUTOCOMPLETE_ON_KEY) return

    const handleKeyPress = async (event) => {
      if (event.key === 'Tab') {
        event.preventDefault()
        if (!inFocus || !editor.selection) return
        setSuggestedWords(null)
        setLoading(true)
        const words = await api.suggestNextWords(editorState)
        setSuggestedWords({ words, state: editorState })
        setLoading(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [editorState, inFocus])

  useEffect(() => {
    if (type !== TOOL_AUTOCOMPLETE) return

    const handler = setTimeout(() => {
      setDebouncedEditorState(editorState)
    }, autoCompleteDelay)
    return () => {
      clearTimeout(handler)
    }
  }, [autoCompleteDelay, editorState])

  useEffect(() => {
    if (type !== TOOL_AUTOCOMPLETE) return

    if (!inFocus || !editor.selection || debouncedEditorState.length < 5) {
      return
    }

    if (
      !debouncedEditorState.endsWith(' ') &&
      !debouncedEditorState.endsWith('.')
    ) {
      return
    }

    let isCancelled = false
    setLoading(true)

    const fetchData = async () => {
      let editorState = debouncedEditorState
      if (editorState.endsWith('.')) {
        editorState = `${editorState} `
      }
      const words = await api.suggestNextWords(debouncedEditorState)
      if (!isCancelled) {
        setSuggestedWords({ words, state: debouncedEditorState })
      }
      setLoading(false)
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [debouncedEditorState, inFocus])

  useEffect(() => {
    if (suggestedWords && suggestedWords.state !== editorState) {
      setSuggestedWords(null)
    }
  }, [editorState, suggestedWords])

  useEffect(() => {
    const el = ref.current
    if (!el || !inFocus || !editor.selection) {
      return
    }
    const domSelection = window.getSelection()
    if (domSelection.rangeCount > 0) {
      const domRange = domSelection.getRangeAt(0)
      const rect = domRange.getBoundingClientRect()
      const popupWidth = el.offsetWidth
      el.style.opacity = '1'
      el.style.top = `${rect.bottom + window.pageYOffset - 76}px` // Adjust distance below the cursor
      el.style.left = `${
        rect.left + window.pageXOffset - popupWidth / 2 + rect.width / 2
      }px`
    }
  }, [editorState, inFocus, editor.selection])

  useEffect(() => {
    if (editor.selection && Range.isExpanded(editor.selection)) {
      setSuggestedWords(null)
    }
  }, [editor.selection])

  const onClick = (index) => {
    if (suggestedWords) {
      let word = suggestedWords.words[index]
      if (debouncedEditorState.endsWith('.')) {
        word = ` ${word}`
      }
      Editor.insertText(editor, `${word}`)
      setSuggestedWords(null)
    }
  }

  const onRefresh = async () => {
    if (suggestedWords) {
      const currentWords = suggestedWords.words
      setSuggestedWords(null)
      setLoading(true)
      const words = await api.getCompletion(editorState, preprompt)
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
                <WordButton
                  key={`Word_${word}`}
                  onClick={() => onClick(index)}
                  word={word}
                  editorState={editorState}
                />
              ))}
            </Flex>
          </div>
        )}
      </Popup>
    </Portal>
  )
}

export default AutoComplete
