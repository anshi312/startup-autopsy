import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string

const genAI = new GoogleGenerativeAI(apiKey)

export function getGeminiModel() {
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
}
