import ReactDOM from 'react-dom'

import styled from '@emotion/styled'
import { useEffect, useMemo, useRef } from 'react'
import { createEditor, Editor, Point, Range } from 'slate'
import { Editable, Slate, useFocused, useSlate, withReact } from 'slate-react'

export const useIsStartingNewWord = () => {
  const editor = useSlate()

  const isStartingNewWord = () => {
    const { selection } = editor

    // Return false if there's no selection or the selection is not collapsed (meaning text is selected)
    if (!selection || !Range.isCollapsed(selection)) {
      return false
    }

    const { anchor } = selection

    // If the cursor is at the very beginning of the document, we're starting a new word
    if (Point.equals(anchor, Editor.start(editor, []))) {
      return true
    }

    // Get the point just before the cursor
    const before = Editor.before(editor, anchor, { unit: 'character' })
    if (!before) {
      return false
    }

    // Get the character before the cursor
    const charBefore = Editor.string(editor, { anchor: before, focus: anchor })

    // Check if the character before the cursor is a space, punctuation, or an empty string
    return charBefore === ' ' || charBefore === '\n'
  }

  return isStartingNewWord
}
