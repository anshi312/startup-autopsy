import { GoogleGenerativeAI } from '@google/generative-ai'
import { FailureScenario } from '../types'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateScenarioImage(scenario: FailureScenario): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      } as never,
    })

    const prompt = `Generate a dark, cinematic, editorial-style documentary photograph representing this startup failure: ${scenario.title}. Context: ${scenario.rootCause}. Style: dramatic lighting, moody, photojournalistic.`

    const result = await model.generateContent(prompt)
    const response = result.response

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if ((part as { inlineData?: { mimeType: string; data: string } }).inlineData) {
        const { mimeType, data } = (part as { inlineData: { mimeType: string; data: string } }).inlineData
        return `data:${mimeType};base64,${data}`
      }
    }

    return null
  } catch {
    return null
  }
}
