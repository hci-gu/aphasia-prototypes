const API_URL = 'http://localhost:8080'

const mockGetNextWord = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve('Hello')
    }, Math.random() * 2000)
  })
}

const REWRITE_SYSTEM_PROMPT = `
You are a rewriting assistant designed to help people with aphasia express their thoughts more clearly. Given a simple input text with basic words or broken sentences, rewrite the content into well-structured, understandable language. Only provide the rewritten suggestion as output—no additional text or explanations. Here’s how you should transform the input:

Structure and Clarity: Break down the input into short, simple sentences that flow naturally. Add missing words only if needed to make the meaning clear.

Appropriate Vocabulary: Use plain language. Avoid jargon, idioms, or complex vocabulary. Keep word choices familiar and accessible.

Consistent Tone: Maintain a friendly, supportive tone that respects the input's intent. Make the rewritten text approachable and respectful of the original expression.

Readability: Focus on making the text readable for someone unfamiliar with complex sentences. Emphasize clarity in every sentence.

Important: Output only the revised, more understandable text. Do not include any introductory or closing statements around it.

Example:

Input: "I… go store… need help… carry things."

Output: "I am going to the store and need help carrying things."
`

const formatPrePrompt = (prompt, prePrompt) => {
  if (!prePrompt) {
    return prompt
  }

  let formattedPrePrompt = prePrompt.text
  switch (prePrompt.type) {
    case 'email':
      formattedPrePrompt = `
User Prompt: Responding to the following email. Make the response polite and clear.
Email text: ${prePrompt.text}
response:`
      break
    default:
      break
  }

  return `${formattedPrePrompt}${prompt}`
}

export async function rewriteText(str, prePrompt = null) {
  const prompt = prePrompt ? formatPrePrompt(str, prePrompt) : str

  console.log('Prompt:', prompt)

  const response = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: REWRITE_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  const data = await response.json()

  return data.choices[0].message.content
}

export async function suggestNextWords(
  str,
  preprompt = null,
  negativeWords = []
) {
  // Create the instruction for excluding negative words
  let negativeWordsPrompt = ''
  if (negativeWords.length > 0) {
    negativeWordsPrompt = `Do not suggest the following words: ${negativeWords.join(
      ', '
    )}.`
  }

  const prompt = preprompt ? formatPrePrompt(str, preprompt) : str

  const response = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
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
    }),
  })
  const data = await response.json()

  if (data.choices.length === 0) {
    return ''
  }

  let words = []
  const text = data.choices[0].message.content
  // if the text doesn't have a new line, return the text split by comma or space
  if (!text.includes('\n')) {
    words = text.split(/,|\s/)
  } else {
    words = text.split('\n')
  }

  // remove the numbers with the dot at the beginning of each line
  words = words.map((word) => word.replace(/^\d+\.\s/, ''))
  // remove anything other than characters
  words = words.map((word) => word.replace(/[^a-zA-Z]/g, ''))
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
      n_predict: 5,
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

export async function getCompletion(prompt) {
  const response = await fetch(`${API_URL}/completion`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      n_probs: 10,
      n_predict: 5,
      stop: ['.'],
    }),
  })
  const data = await response.json()
  const nextTokens = data.completion_probabilities[0].probs
  const withoutEmpty = nextTokens.filter((token) => token.tok_str.trim() !== '')

  const words = []
  for (const word of withoutEmpty) {
    const nextWord = await getNextWord(prompt + word.tok_str)
    words.push({
      word: nextWord,
      probability: word.prob,
    })
  }

  return words
}
