const API_KEY = import.meta.env.VITE_AZURE_API_KEY

const MODEL = 'gpt-4-o-mini'

const ENDPOINT =
  'https://gu-ai-006.openai.azure.com/openai/deployments/gpt-4o-mini/chat/completions?api-version=2024-02-15-preview'

//   https://gu-ai-006.openai.azure.com/openai/deployments/gpt-4-o/chat/completions?api-version=2024-08-01-preview

export default async function (body) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    },
    body: JSON.stringify(body),
  })

  return response.json()
}
