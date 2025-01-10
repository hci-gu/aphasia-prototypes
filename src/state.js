import { atom, useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { debounce } from 'lodash'
import { atomWithStorage } from 'jotai/utils'
import { EMAILS } from './emails'

export const suggestedWordsAtom = atom([])

export const profileAtom = atomWithStorage('profile', '')

export const prepromptAtom = atom(null)

// export const additionalSystemPromptAtom = atom(null)

export const TOOL_AUTOCOMPLETE = 'Auto complete'
export const TOOL_AUTOCOMPLETE_ON_KEY = 'Auto complete on key'
export const TOOL_REWRITER = 'Rewriter'
export const TOOL_RESPONSE_BUTTONS = 'Response buttons'
export const availableTools = [
  TOOL_AUTOCOMPLETE,
  TOOL_AUTOCOMPLETE_ON_KEY,
  TOOL_RESPONSE_BUTTONS,
  TOOL_REWRITER,
]
export const activeToolAtom = atomWithStorage('activeTool', availableTools[0])

export const toolSettingsAtom = atomWithStorage('toolSettings', {
  autoCompleteDelay: 500,
  autoCompleteMaxWords: 5,
})

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

export const INITIAL_EMAILS_STATE = EMAILS.map((email) => ({
  ...email,
  responses: [],
  read: false,
}))

export const emailsAtom = atomWithStorage('emails', INITIAL_EMAILS_STATE)

export const selectedEmailAtom = atom(null)
