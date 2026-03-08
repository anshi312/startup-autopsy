import type { Part } from '@google/generative-ai'
import { getGeminiModel } from './gemini'
import { pdfToBase64, imageToBase64 } from '../utils/fileConvert'
import type { StartupProfile } from '../types'

const SYSTEM_PROMPT = `You are a startup analyst. Extract a structured startup profile from the provided inputs.
Respond ONLY with valid JSON matching this exact structure, no markdown, no code fences:
{
  "name": "string",
  "problem": "string",
  "solution": "string",
  "targetMarket": "string",
  "businessModel": "string",
  "revenueModel": "string",
  "teamDescription": "string",
  "stage": "string",
  "uniqueInsight": "string"
}`

export async function extractStartupProfile(
  text: string,
  pdfFile: File | null,
  imageFiles: File[],
): Promise<StartupProfile> {
  const parts: Part[] = []

  if (text.trim()) {
    parts.push({ text })
  }

  if (pdfFile) {
    const base64 = await pdfToBase64(pdfFile)
    parts.push({
      inlineData: { data: base64, mimeType: 'application/pdf' },
    })
  }

  for (const file of imageFiles) {
    const { base64, mimeType } = await imageToBase64(file)
    parts.push({
      inlineData: { data: base64, mimeType },
    })
  }

  const model = getGeminiModel()
  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{ role: 'user', parts }],
  })

  const raw = result.response.text()

  // Strip markdown code fences if present (```json ... ``` or ``` ... ```)
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    return JSON.parse(cleaned) as StartupProfile
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON:\n${raw}`)
  }
}
