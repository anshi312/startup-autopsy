import { getGeminiModel } from './gemini'
import type { StartupProfile, Assumption, FailureScenario } from '../types'

const SCHEMA = `{
  "title": "string",
  "rootCause": "string",
  "severity": "catastrophic" | "severe" | "moderate",
  "failureType": "market" | "execution" | "competition" | "financial" | "team",
  "timeline": [{ "month": number, "headline": "string", "description": "string" }],
  "earlyWarnings": ["string"],
  "quote": { "text": "string", "attribution": "string" },
  "pivotSuggestion": "string",
  "validationStep": "string"
}`

const SYSTEM_PROMPT =
  'You are a startup failure analyst. Generate exactly 3 realistic failure scenarios for this startup. ' +
  'Each scenario must have a DIFFERENT failureType. ' +
  'Make timelines span 6-18 months. ' +
  'Write headlines like news articles. ' +
  'Write the quote as if from a founder or investor reflecting on what went wrong. ' +
  `Respond ONLY with a JSON array of 3 scenarios matching this schema: ${SCHEMA}`

export async function generateFailureScenarios(
  profile: StartupProfile,
  assumptions: Assumption[],
): Promise<FailureScenario[]> {
  const model = getGeminiModel()
  const result = await model.generateContent({
    systemInstruction: SYSTEM_PROMPT,
    contents: [{
      role: 'user',
      parts: [{
        text:
          `Startup profile:\n${JSON.stringify(profile, null, 2)}\n\n` +
          `Key assumptions:\n${JSON.stringify(assumptions, null, 2)}`,
      }],
    }],
  })

  const raw = result.response.text()
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  let parsed: FailureScenario[]
  try {
    parsed = JSON.parse(cleaned) as FailureScenario[]
  } catch {
    throw new Error(`Failed to parse failure scenarios as JSON:\n${raw}`)
  }

  if (!Array.isArray(parsed) || parsed.length !== 3) {
    throw new Error(`Expected 3 failure scenarios, got ${Array.isArray(parsed) ? parsed.length : 'non-array'}:\n${raw}`)
  }

  return parsed
}
