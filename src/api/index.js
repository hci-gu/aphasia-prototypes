const API_URL = 'http://localhost:8080'
import {
  REWRITE_SYSTEM_PROMPT,
  RESPONSE_BUTTONS_SYSTEM_PROMPT,
  formatPrePrompt,
  SUGGEST_TEXT_PROMPT,
} from './prompts'
import azureRequest from './azure'

const mockGetNextWord = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Hello')
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
  profile = null
) => {
  const messages = [systemMessage]

  const prompt = prePrompt ? formatPrePrompt(text, prePrompt) : text

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

export async function rewriteText(str, prePrompt = null, profile = null) {
  const data = await makeRequest({
    messages: buildMessages(
      {
        role: 'system',
        content: REWRITE_SYSTEM_PROMPT,
      },
      str,
      prePrompt,
      profile
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

export async function suggestNextWords(
  str,
  preprompt = null,
  profile = null,
  negativeWords = []
) {
  const word = await mockGetNextWord()
  return [word, word, word]

  // Create the instruction for excluding negative words
  let negativeWordsPrompt = ''
  if (negativeWords.length > 0) {
    negativeWordsPrompt = `Do not suggest the following words: ${negativeWords.join(
      ', '
    )}.`
  }

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
      max_tokens: 3,
      temperature: 0.99,
      n: 7,
    })
    console.log(data)
    const words = data.choices.map((choice) => {
      // get first word
      const firstWord = choice.message.content.split(' ')[0]
      return firstWord
    })
    // filter identical words
    const uniqueWords = [...new Set(words)]

    console.log(words, uniqueWords)
    return uniqueWords
    const text = data.choices[0].message.content
    console.log(text, text.split('\n'))
    return text.split('\n')
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
