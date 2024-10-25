import ReactDOM from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { Editor } from 'slate'
import { useFocused, useSlate } from 'slate-react'
import { debounce } from 'lodash'
import * as api from '../../api'
import { Button, Flex, Loader } from '@mantine/core'
import { IconRefresh } from '@tabler/icons-react'
import { useAtomValue } from 'jotai'
import { prepromptAtom } from '../../state'

const Popup = styled.div`
  padding: 8px 7px 6px;
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

const AutoComplete = () => {
  const ref = useRef()
  const editor = useSlate()
  const inFocus = useFocused()
  const [loading, setLoading] = useState(false)
  const [suggestedWords, setSuggestedWords] = useState(null)
  const preprompt = useAtomValue(prepromptAtom)

  const editorState = Editor.string(editor, [])

  const [debouncedEditorState, setDebouncedEditorState] = useState(editorState)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedEditorState(editorState)
    }, 500)
    return () => {
      clearTimeout(handler)
    }
  }, [editorState])

  useEffect(() => {
    if (!inFocus || !editor.selection || debouncedEditorState.length < 5) {
      return
    }

    let isCancelled = false
    setLoading(true)

    const fetchData = async () => {
      const words = await api.suggestNextWords(debouncedEditorState, preprompt)
      if (!isCancelled) {
        setSuggestedWords({ words, state: debouncedEditorState })
      }
      setLoading(false)
    }

    fetchData()

    return () => {
      isCancelled = true
    }
  }, [debouncedEditorState, preprompt, inFocus])

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
      el.style.opacity = '1'
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
      el.style.left = `${
        rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
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
      const words = await api.getCompletion(editorState, preprompt)
      //   const words = await api.suggestNextWords(
      //     editorState,
      //     preprompt,
      //     currentWords
      //   )
      setSuggestedWords({ words, state: editorState })
      setLoading(false)
    }
  }

  return (
    <Portal>
      <Popup ref={ref} onMouseDown={(e) => e.preventDefault()}>
        {loading && <Loader />}
        {suggestedWords && (
          <div style={{ position: 'relative' }}>
            <Button
              p={4}
              radius={100}
              style={{
                position: 'absolute',
                right: -32,
                top: -32,
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

export default AutoComplete
