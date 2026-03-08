import { GoogleGenerativeAI } from '@google/generative-ai'

function pcmToWav(pcmBase64: string, mimeType: string): string {
  const rateMatch = mimeType.match(/rate=(\d+)/i)
  const sampleRate = rateMatch ? parseInt(rateMatch[1]) : 24000
  const numChannels = 1
  const bitsPerSample = 16
  const pcmBytes = atob(pcmBase64)
  const pcmLength = pcmBytes.length
  const buffer = new ArrayBuffer(44 + pcmLength)
  const view = new DataView(buffer)
  const writeStr = (offset: number, str: string) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)) }
  writeStr(0, 'RIFF')
  view.setUint32(4, 36 + pcmLength, true)
  writeStr(8, 'WAVE')
  writeStr(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * bitsPerSample / 8, true)
  view.setUint16(32, numChannels * bitsPerSample / 8, true)
  view.setUint16(34, bitsPerSample, true)
  writeStr(36, 'data')
  view.setUint32(40, pcmLength, true)
  for (let i = 0; i < pcmLength; i++) view.setUint8(44 + i, pcmBytes.charCodeAt(i))
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return `data:audio/wav;base64,${btoa(binary)}`
}
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
        const { mimeType, data } = p.inlineData
        if (mimeType.startsWith('audio/L16') || mimeType.startsWith('audio/pcm')) {
          audioBase64 = pcmToWav(data, mimeType)
        } else {
          audioBase64 = `data:${mimeType};base64,${data}`
        }
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
