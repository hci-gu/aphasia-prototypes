import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { debounce } from 'lodash'

import * as api from './api'

export const suggestedWordsAtom = atom([])

export const prepromptAtom = atom(null)

// export const additionalSystemPromptAtom = atom(null)

export const TOOL_AUTOCOMPLETE = 'Auto complete'
export const TOOL_REWRITER = 'Rewriter'
export const TOOL_RESPONSE_BUTTONS = 'Response buttons'
export const availableTools = [
  TOOL_RESPONSE_BUTTONS,
  TOOL_AUTOCOMPLETE,
  TOOL_REWRITER,
]
export const activeToolAtom = atom(availableTools[0])

const mockSetWords = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { word: 'Hello', probability: Math.random() },
        { word: 'Goodbye', probability: Math.random() },
      ])
    }, Math.random() * 2000)
  })
}

export const useNextWords = (prompt = '') => {
  const prePrompt = useAtomValue(prepromptAtom)
  const [words, setWords] = useAtom(suggestedWordsAtom)

  useEffect(() => {
    const fetchWords = async (fullPrompt) => {
      //   const words = await api.getCompletion(fullPrompt)
      const words = await mockSetWords()
      setWords(words)
    }

    // Debounce the API call
    const debouncedFetchWords = debounce((fullPrompt) => {
      fetchWords(fullPrompt)
    }, 500) // 500ms debounce delay

    debouncedFetchWords(`${prePrompt}${prompt}`)

    // Cleanup the debounce on unmount
    return () => {
      debouncedFetchWords.cancel()
    }
  }, [prompt, prePrompt])

  return words
}
