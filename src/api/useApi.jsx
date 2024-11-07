import * as api from './index'
import { prepromptAtom, profileAtom } from '../state'
import { useAtomValue } from 'jotai'

export default function useApi() {
  const preprompt = useAtomValue(prepromptAtom)
  const profile = useAtomValue(profileAtom)

  return {
    getCompletion: (text) => api.suggestNextWords(text, preprompt, profile),
    rewriteText: (text) => api.rewriteText(text, preprompt, profile),
    suggestResponseButtons: () =>
      api.suggestResponseButtons(preprompt.text, null, profile),
    suggestNextWords: (text) => api.suggestNextWords(text, preprompt, profile),
  }
}
