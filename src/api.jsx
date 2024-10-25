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

const RESPONSE_BUTTONS_SYSTEM_PROMPT = `
System Prompt:

You are an assistant that generates structured response options based on a provided piece of content, such as an email or chat history. Your task is to output exactly four types of responses, formatted strictly as follows, with no additional text or explanations. Each response type should include the specific tone or action requested:

Positive Response: An affirmative reply (e.g., agreeing, confirming, or a polite "yes").

Negative Response: A respectful, polite reply indicating decline or a gentle "no."

Clarification Response: A request for more information if there's any part of the content that could benefit from additional clarity.

Choice-Listing Response: If the content contains multiple options, list them clearly and suggest selecting one. When multiple times are offered, list those times in the response.

The format for your output should be strictly as follows, without any introductory or closing statements:

Positive Response: [Response text]

Negative Response: [Response text]

Clarification Response: [Response text]

Choice-Listing Response: [Response text]
Example Content 1: "Would you be able to join our team meeting on Thursday at 10 am? Please let us know if you have any conflicts."

Example Output 1:

Positive Response: Yes, I can join the team meeting on Thursday at 10 am. Thank you!

Negative Response: Unfortunately, I won't be able to attend on Thursday. I appreciate the invite, though.

Clarification Response: Could you confirm if the meeting will be in person or online?

Choice-Listing Response: Are there any alternative times in case of a scheduling conflict?

Example Content 2: "We'd like to schedule a meeting. Are you available on Monday at 9 am, Wednesday at 2 pm, or Friday at 11 am?"

Example Output 2:

Alternative 1: I am available on Monday at 9 am and would be happy to join.

Alternative 2: I am available on Wednesday at 2 pm and would be happy to join.

ALternative 3: I am available on Friday at 11 am and would be happy to join.

Choice-Listing Response: I can attend at any of the suggested times: Monday at 9 am, Wednesday at 2 pm, or Friday at 11 am. Let me know which works best.

Negative Response: I am unavailable for all of the suggested times. Could we find an alternative time?
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

export async function suggestResponseButtons(str, prePrompt = null) {
  const prompt = prePrompt ? formatPrePrompt(str, prePrompt) : str

  const response = await fetch(`${API_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: RESPONSE_BUTTONS_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  })

  const data = await response.json()

  const text = data.choices[0].message.content

  // extract the different responses
  const responses = text.split('\n\n')

  return responses
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

export async function getCompletion(str, preprompt = null) {
  console.log('getCompletion', str, preprompt)
  const prompt = preprompt ? formatPrePrompt(str, preprompt) : str

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

  // for (const word of withoutEmpty) {
  //   const nextWord = await getNextWord(prompt + word.tok_str)
  //   words.push(nextWord)
  // }

  return words
}
