import ReactDOM from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import styled from '@emotion/styled'
import { Editor } from 'slate'
import { useFocused, useSlate } from 'slate-react'
import { useIsStartingNewWord } from './hooks'
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
  const [loading, setLoading] = useState(true)
  const [suggestedWords, setSuggestedWords] = useState(null)
  const preprompt = useAtomValue(prepromptAtom)
  const isStartingNewWord = useIsStartingNewWord()

  useEffect(() => {
    const el = ref.current
    const { selection } = editor
    if (!el || !inFocus || !selection) {
      return
    }

    const run = async () => {
      // Always show the menu at the cursor position, even if no text is selected
      const domSelection = window.getSelection()
      if (domSelection.rangeCount > 0) {
        const domRange = domSelection.getRangeAt(0)
        const rect = domRange.getBoundingClientRect()
        el.style.opacity = '1'
        el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`
        el.style.left = `${
          rect.left + window.pageXOffset - el.offsetWidth / 2 + rect.width / 2
        }px`
        console.log(isStartingNewWord(), Editor.string(editor, []))

        if (!suggestedWords) {
          const editorState = Editor.string(editor, [])
          if (!editorState || editorState.length < 5) {
            return
          }
          // const prompt = `${basePrompt}\n${editorState}`
          setLoading(true)
          const words = await api.suggestNextWords(editorState, preprompt)
          setLoading(false)
          setSuggestedWords({
            words,
            state: editorState,
          })
        }
      }
    }
    const debouncedRun = debounce(run, 500)

    let timeout
    if (loading) {
      timeout = setTimeout(() => {
        debouncedRun()
      }, 1000)
    }

    return () => {
      clearTimeout(timeout)
      debouncedRun.cancel()
    }
  }, [preprompt, editor, isStartingNewWord])

  useEffect(() => {
    if (suggestedWords) {
      const editorState = Editor.string(editor, [])
      if (suggestedWords.state != editorState) {
        setSuggestedWords(null)
      }
    }
  })

  const onClick = (index) => {
    if (suggestedWords) {
      const word = suggestedWords.words[index]
      Editor.insertText(editor, `${word} `)
      setSuggestedWords(null)
    }
  }

  const onRefresh = async () => {
    if (suggestedWords) {
      const editorState = Editor.string(editor, [])
      const currentWords = suggestedWords.words
      setSuggestedWords(null)
      setLoading(true)
      const words = await api.suggestNextWords(
        editorState,
        preprompt,
        currentWords
      )
      setLoading(false)
      setSuggestedWords({
        words,
        state: editorState,
      })
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
