const API_URL = 'http://localhost:8080'
import {
  REWRITE_SYSTEM_PROMPT,
  RESPONSE_BUTTONS_SYSTEM_PROMPT,
  formatPrePrompt,
  SUGGEST_TEXT_PROMPT,
  RESPONSE_BUTTON_REWRITE_SYSTEM_PROMPT,
  extraRewritePromptForStyle,
  SIMPLIFY_FOR_READING_PROMPT,
} from './prompts'
import azureRequest from './azure'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

const mockGetNextWords = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(['Hello', 'Goodbye', 'Please', 'Thank', 'You'])
    }, Math.random() * 2000)
  })
}

const ACTIVE_CLIENT = 'azure'
const makeRequest = async (body) => {
  console.log('MAKE_REQUEST', ACTIVE_CLIENT, body)
  switch (ACTIVE_CLIENT) {
    case 'azure':
      return azureRequest(body)
    case 'local':
    default:
      const response = await fetch(`${API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      return response.json()
  }
}

const buildMessages = (
  systemMessage,
  text,
  prePrompt = null,
  profile = null,
  type = 'chat'
) => {
  const messages = [systemMessage]

  const prompt =
    prePrompt && type == 'chat' ? formatPrePrompt(text, prePrompt) : text

  if (profile) {
    messages.push({
      role: 'user',
      content: `Information about the user: ${profile}`,
    })
  }

  messages.push({
    role: 'user',
    content: prompt,
  })

  return messages
}

export async function rewriteButtonResponse(
  str,
  prePrompt = null,
  profile = null
) {
  const data = await makeRequest({
    messages: buildMessages(
      {
        role: 'system',
        content: RESPONSE_BUTTON_REWRITE_SYSTEM_PROMPT,
      },
      str,
      prePrompt,
      profile
    ),
  })

  return data.choices[0].message.content
}

export async function rewriteText(
  str,
  prePrompt = null,
  profile = null,
  style = ''
) {
  const data = await makeRequest({
    messages: buildMessages(
      {
        role: 'system',
        content:
          style == 'minimal'
            ? extraRewritePromptForStyle(style)
            : `${REWRITE_SYSTEM_PROMPT}\n${extraRewritePromptForStyle(style)}`,
      },
      str,
      prePrompt,
      profile,
      style !== 'formal' ? 'rewrite' : undefined
    ),
  })

  return data.choices[0].message.content
}

export async function suggestResponseButtons(
  str,
  prePrompt = null,
  profile = null
) {
  const data = await makeRequest({
    messages: buildMessages(
      {
        role: 'system',
        content: RESPONSE_BUTTONS_SYSTEM_PROMPT,
      },
      str,
      prePrompt,
      profile
    ),
  })

  const text = data.choices[0].message.content
  const responses = text.split('\n\n')
  return responses
}

const extractFirstWordFromText = (text) => {
  const words = text.split(' ')
  return words[0]
}

export async function suggestNextWords(
  str,
  preprompt = null,
  profile = null,
  maxWords = 5
) {
  console.log(preprompt, str)
  const completion = await openai.completions.create({
    model: 'gpt-3.5-turbo-instruct',
    prompt: `You are responding to an email, some information about you: ${profile.replace(
      /[\t\n]/g,
      ' '
    )}. Email you are responding to: ${preprompt.text.replace(
      /[\t\n]/g,
      ' '
    )} Response: ${str.replace(/[\t\n]/g, ' ')}`,
    temperature: 1,
    max_tokens: 10,
    logprobs: 5,
    n: 5,
  })
  console.log('completion', completion)

  let _words = completion.choices.map((choice) =>
    extractFirstWordFromText(choice.text)
  )
  _words = _words.filter((word) => word !== '')
  return [...new Set(_words)]

  return _words

  // const logprobs = completion.choices[0].logprobs.top_logprobs
  // if (!logprobs.length) return []

  // const first = logprobs[0]
  // // word and probability pairs
  // const _words = Object.keys(first).map((word) => ({
  //   word,
  //   probability: Math.exp(first[word]),
  // }))
  // _words.sort((a, b) => b.probability - a.probability)
  // console.log(
  //   'completion',
  //   _words.map((w) => `${w.word} (${w.probability})`).join(', ')
  // )
  // return _words.map((word) => word.word)

  // console.log('completion', _words)

  const prompt = preprompt ? formatPrePrompt(str, preprompt) : str

  if (ACTIVE_CLIENT === 'azure') {
    const data = await makeRequest({
      messages: buildMessages(
        {
          role: 'system',
          content: SUGGEST_TEXT_PROMPT,
        },
        str,
        preprompt,
        profile
      ),
      max_tokens: 8,
      temperature: 0.99,
      n: 5,
    })
    let words = []
    for (let choice of data.choices) {
      if (!choice.message.content) continue

      const choiceWords = choice.message.content.split(' ')

      for (let i = 0; i < 2; i++) {
        const cleanedWord = choiceWords[i].replace(/[^a-zA-ZåäöÅÄÖ]/g, '')
        words.push(cleanedWord)
        if (i == 0) {
          words.push(cleanedWord)
          words.push(cleanedWord)
        }
      }
    }
    words.filter((word) => word !== '')

    // create map with word frequencies
    const wordMap = new Map()
    words.forEach((word) => {
      const count = wordMap.get(word) || 0
      wordMap.set(word, count + 1)
    })

    // filter identical words
    const uniqueWords = [...new Set(words)]
    // sort by frequency
    uniqueWords.sort((a, b) => wordMap.get(b) - wordMap.get(a))

    // return only the top N words
    return uniqueWords.slice(0, maxWords)
  }

  const data = await makeRequest({
    messages: [
      {
        role: 'system',
        content:
          'You are an AI language model that predicts the next most likely words in a sentence.',
      },
      {
        role: 'user',
        content: `Please take the following sentence and suggest the top 5 most likely words that could follow. Return only the list of words, nothing else. ${negativeWordsPrompt}`,
      },
      {
        role: 'user',
        content: `Sentence: ${prompt}`,
      },
    ],
  })

  if (data.choices.length === 0) {
    return ''
  }

  let words = []
  const text = data.choices[0].message.content
  console.log(text)
  // if the text doesn't have a new line, return the text split by comma or space
  if (!text.includes('\n')) {
    words = text.split(/,|\s/)
  } else {
    words = text.split('\n')
  }

  // remove the numbers with the dot at the beginning of each line
  words = words.map((word) => word.replace(/^\d+\.\s/, ''))
  // remove anything other than characters
  words = words.map((word) => word.replace(/[^a-zA-ZåäöÅÄÖ]/g, ''))
  return words
}

export async function getNextWord(str) {
  // return mockGetNextWord()
  const response = await fetch(`${API_URL}/completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: str,
      n_predict: 3,
      temperature: 1.0,
      top_k: 50,
      top_p: 0.5,
      stop: ['.', '!', '?', ',', '\n'],
    }),
  })
  const data = await response.json()

  const lastPartOfPrompt = str.split(' ').slice(-1)[0]

  const text = lastPartOfPrompt + data.content

  const firstWordOfNextSentence = text.split(' ')[0]

  return firstWordOfNextSentence
}

export async function getCompletion(str, preprompt = null, profile = null) {
  const prompt = preprompt ? formatPrePrompt(str, preprompt) : str

  if (ACTIVE_CLIENT === 'azure') {
    const data = await makeRequest({
      messages: buildMessages(
        {
          role: 'system',
          content: SUGGEST_TEXT_PROMPT,
        },
        str,
        preprompt,
        profile
      ),
    })
    const text = data.choices[0].message.content
    return text.split('\n')
  }

  const response = await fetch(`${API_URL}/completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      n_probs: 5,
      n_predict: 5,
      stop: ['.'],
    }),
  })
  const data = await response.json()
  const nextTokens = data.completion_probabilities[0].probs
  const withoutEmpty = nextTokens.filter((token) => token.tok_str.trim() !== '')

  // const words = []
  const words = Promise.all(
    withoutEmpty.map((word) => getNextWord(str + word.tok_str))
  )

  return words
}

export async function simplifyText(str) {
  if (ACTIVE_CLIENT == 'azure') {
    const data = await makeRequest({
      messages: [
        {
          role: 'system',
          content: SIMPLIFY_FOR_READING_PROMPT,
        },
        {
          role: 'user',
          content: str,
        },
      ],
    })
    return data.choices[0].message.content
  }
}
