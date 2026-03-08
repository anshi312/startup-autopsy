import { getGeminiModel } from './gemini'
import type { StartupProfile, Assumption } from '../types'

const SYSTEM_PROMPT =
  'You are a startup analyst. Given a startup profile, identify key assumptions the founders are making. ' +
  'Return ONLY a JSON array, no markdown, no code fences.'

const USER_PROMPT = (profile: StartupProfile) =>
  `Given this startup profile, identify 5-8 key assumptions the founders are making. ` +
  `Return ONLY a JSON array where each item has: ` +
  `id (string), category (one of: market, product, financial, team, competition), ` +
  `statement (string), riskLevel (one of: high, medium, low).\n\n` +
  `Startup profile:\n${JSON.stringify(profile, null, 2)}`

export async function extractAssumptions(profile: StartupProfile): Promise<Assumption[]> {
  const model = getGeminiModel()
  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{ role: 'user', parts: [{ text: USER_PROMPT(profile) }] }],
  })

  const raw = result.response.text()
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    return JSON.parse(cleaned) as Assumption[]
  } catch {
    throw new Error(`Failed to parse assumptions response as JSON:\n${raw}`)
  }
}
