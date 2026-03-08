import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { GoogleGenerativeAI, type Part } from '@google/generative-ai'

const app = express()
const PORT = 3001

const apiKey = process.env.GEMINI_API_KEY ?? ''
const genAI = new GoogleGenerativeAI(apiKey)

const upload = multer({ storage: multer.memoryStorage() })

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

const ASSUMPTIONS_SYSTEM_PROMPT =
  'You are a startup analyst. Given a startup profile, identify key assumptions the founders are making. ' +
  'Return ONLY a JSON array, no markdown, no code fences.'

const assumptionsUserPrompt = (profile: object) =>
  `Given this startup profile, identify 5-8 key assumptions the founders are making. ` +
  `Return ONLY a JSON array where each item has: ` +
  `id (string), category (one of: market, product, financial, team, competition), ` +
  `statement (string), riskLevel (one of: high, medium, low).\n\n` +
  `Startup profile:\n${JSON.stringify(profile, null, 2)}`

app.post('/api/assumptions', async (req, res) => {
  try {
    const profile = req.body
    if (!profile || typeof profile !== 'object') {
      res.status(400).json({ error: 'Invalid profile body' })
      return
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent({
      systemInstruction: ASSUMPTIONS_SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: assumptionsUserPrompt(profile) }] }],
    })

    const raw = result.response.text()
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

    const assumptions = JSON.parse(cleaned)
    res.json(assumptions)
  } catch (err) {
    console.error('/api/assumptions error:', err)
    res.status(500).json({ error: 'Failed to extract assumptions' })
  }
})

const SCENARIOS_SCHEMA = `{
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

const SCENARIOS_SYSTEM_PROMPT =
  'You are a startup failure analyst. Generate exactly 3 realistic failure scenarios for this startup. ' +
  'Each scenario must have a DIFFERENT failureType. ' +
  'Make timelines span 6-18 months. ' +
  'Write headlines like news articles. ' +
  'Write the quote as if from a founder or investor reflecting on what went wrong. ' +
  `Respond ONLY with a JSON array of 3 scenarios matching this schema: ${SCENARIOS_SCHEMA}`

app.post('/api/scenarios', async (req, res) => {
  try {
    const { profile, assumptions } = req.body
    if (!profile || !Array.isArray(assumptions)) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent({
      systemInstruction: SCENARIOS_SYSTEM_PROMPT,
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

    const parsed = JSON.parse(cleaned)
    if (!Array.isArray(parsed) || parsed.length !== 3) {
      res.status(500).json({ error: `Expected 3 scenarios, got ${Array.isArray(parsed) ? parsed.length : 'non-array'}` })
      return
    }

    res.json(parsed)
  } catch (err) {
    console.error('/api/scenarios error:', err)
    res.status(500).json({ error: 'Failed to generate failure scenarios' })
  }
})

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post(
  '/api/analyze',
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]),
  async (req, res) => {
    try {
      const text: string = req.body.text ?? ''
      const files = req.files as Record<string, Express.Multer.File[]> | undefined

      const parts: Part[] = []

      if (text.trim()) {
        parts.push({ text })
      }

      const pdfFiles = files?.['pdf'] ?? []
      if (pdfFiles.length > 0) {
        const pdf = pdfFiles[0]
        parts.push({
          inlineData: {
            data: pdf.buffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        })
      }

      const imageFiles = files?.['images'] ?? []
      for (const img of imageFiles) {
        parts.push({
          inlineData: {
            data: img.buffer.toString('base64'),
            mimeType: img.mimetype,
          },
        })
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await model.generateContent({
        systemInstruction: SYSTEM_PROMPT,
        contents: [{ role: 'user', parts }],
      })

      const raw = result.response.text()
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

      const profile = JSON.parse(cleaned)
      res.json(profile)
    } catch (err) {
      console.error('/api/analyze error:', err)
      res.status(500).json({ error: 'Failed to analyze startup profile' })
    }
  }
)

type FailureScenario = {
  title: string
  rootCause: string
  timeline: { month: number; headline: string }[]
}

async function serverGenerateImage(scenario: FailureScenario): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseModalities: ['IMAGE', 'TEXT'],
      } as never,
    })
    const prompt = `Generate a dark, cinematic, editorial-style documentary photograph representing this startup failure: ${scenario.title}. Context: ${scenario.rootCause}. Style: dramatic lighting, moody, photojournalistic.`
    const result = await model.generateContent(prompt)
    for (const part of result.response.candidates?.[0]?.content?.parts ?? []) {
      const p = part as { inlineData?: { mimeType: string; data: string } }
      if (p.inlineData) return `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`
    }
    return null
  } catch {
    return null
  }
}

async function serverGenerateNarration(scenario: FailureScenario): Promise<{ audioBase64: string; narrationText: string } | null> {
  try {
    const ttsPrompt = `Narrate the following startup failure scenario in a serious, reflective documentary tone like a Netflix narrator. Speak in second person to the founder. Keep it under 80 words.\n\nTitle: ${scenario.title}\nRoot cause: ${scenario.rootCause}\nTimeline: ${scenario.timeline.map(t => t.headline).join(' → ')}`

    const ttsModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-tts',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
        },
      } as never,
    })
    const ttsResult = await ttsModel.generateContent(ttsPrompt)
    let audioBase64: string | null = null
    for (const part of ttsResult.response.candidates?.[0]?.content?.parts ?? []) {
      const p = part as { inlineData?: { mimeType: string; data: string } }
      if (p.inlineData) { audioBase64 = `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`; break }
    }
    if (!audioBase64) return null

    const textPrompt = `Write a 4-5 sentence documentary narrator voiceover script for this startup failure scenario. Title: ${scenario.title}. Root cause: ${scenario.rootCause}. Timeline summary: ${scenario.timeline.map(t => t.headline).join(' → ')}. Use a serious, reflective tone like a Netflix documentary narrator. Speak in second person to the founder. Keep it under 80 words. Return only the narration text, no formatting.`
    const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const textResult = await textModel.generateContent(textPrompt)
    const narrationText = textResult.response.text()

    return { audioBase64, narrationText }
  } catch {
    return null
  }
}

app.post('/api/scenario-media', async (req, res) => {
  try {
    const scenario = req.body as FailureScenario
    if (!scenario?.title || !scenario?.rootCause) {
      res.status(400).json({ error: 'Invalid scenario body' })
      return
    }

    const [image, narration] = await Promise.all([
      serverGenerateImage(scenario),
      serverGenerateNarration(scenario),
    ])

    res.json({ image, narration })
  } catch (err) {
    console.error('/api/scenario-media error:', err)
    res.status(500).json({ error: 'Failed to generate scenario media' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
