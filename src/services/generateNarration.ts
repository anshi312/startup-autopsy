import { GoogleGenerativeAI } from '@google/generative-ai'
import { getGeminiModel } from './gemini'
import type { FailureScenario } from '../types'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string
const genAI = new GoogleGenerativeAI(apiKey)

export async function generateNarrationText(scenario: FailureScenario): Promise<string> {
  const model = getGeminiModel()

  const prompt = `Write a 4-5 sentence documentary narrator voiceover script for this startup failure scenario. Title: ${scenario.title}. Root cause: ${scenario.rootCause}. Timeline summary: ${scenario.timeline.map(t => t.headline).join(' → ')}. Use a serious, reflective tone like a Netflix documentary narrator. Speak in second person to the founder. Keep it under 80 words. Return only the narration text, no formatting.`

  const result = await model.generateContent(prompt)
  return result.response.text()
}

export async function generateNarrationAudio(
  scenario: FailureScenario
): Promise<{ audioBase64: string; narrationText: string } | null> {
  try {
    const prompt = `Narrate the following startup failure scenario in a serious, reflective documentary tone like a Netflix narrator. Speak in second person to the founder. Keep it under 80 words.

Title: ${scenario.title}
Root cause: ${scenario.rootCause}
Timeline: ${scenario.timeline.map(t => t.headline).join(' → ')}`

    const ttsModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-tts',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: 'Kore',
            },
          },
        },
      } as never,
    })

    const result = await ttsModel.generateContent(prompt)
    const parts = result.response.candidates?.[0]?.content?.parts ?? []

    let audioBase64: string | null = null
    for (const part of parts) {
      const p = part as { inlineData?: { mimeType: string; data: string }; text?: string }
      if (p.inlineData) {
        audioBase64 = `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`
        break
      }
    }

    if (!audioBase64) return null

    const narrationText = await generateNarrationText(scenario)

    return { audioBase64, narrationText }
  } catch {
    return null
  }
}
