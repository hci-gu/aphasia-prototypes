import * as api from './index'
import { prepromptAtom, profileAtom, toolSettingsAtom } from '../state'
import { useAtomValue } from 'jotai'

export default function useApi() {
  const preprompt = useAtomValue(prepromptAtom)
  const profile = useAtomValue(profileAtom)
  const toolSettings = useAtomValue(toolSettingsAtom)

  return {
    getCompletion: (text) =>
      api.suggestNextWords(
        text,
        preprompt,
        profile,
        toolSettings.autoCompleteMaxWords
      ),
    rewriteText: (text, style) =>
      api.rewriteText(text, preprompt, profile, style),
    rewriteButtonResponse: (text) =>
      api.rewriteButtonResponse(text, preprompt, profile),
    suggestResponseButtons: () =>
      api.suggestResponseButtons(preprompt.text, null, profile),
    suggestNextWords: (text) =>
      api.suggestNextWords(
        text,
        preprompt,
        profile,
        toolSettings.autoCompleteMaxWords
      ),
    simplifyText: (text) => api.simplifyText(text),
  }
}
