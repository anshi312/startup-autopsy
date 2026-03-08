import express, { type Request, type Response, type NextFunction } from 'express'
import cors from 'cors'
import multer from 'multer'
import crypto from 'node:crypto'
import { GoogleGenerativeAI, type Part } from '@google/generative-ai'
import { logger } from './logger.js'
import { metrics } from './metrics.js'

const app = express()
const PORT = process.env.PORT ?? '8080'

const apiKey = process.env.GEMINI_API_KEY ?? ''
if (!apiKey) {
  logger.warn('GEMINI_API_KEY is not set — AI endpoints will fail')
}
const genAI = new GoogleGenerativeAI(apiKey)

const upload = multer({ storage: multer.memoryStorage() })

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  process.env.DEPLOYED_ORIGIN,
].filter(Boolean) as string[]

app.use(cors({ origin: ALLOWED_ORIGINS }))
app.use(express.json())

// ── Request logging middleware ────────────────────────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  const reqId = crypto.randomUUID().slice(0, 8)
  const start = Date.now()
  ;(req as Request & { reqId: string }).reqId = reqId

  res.on('finish', () => {
    const durationMs = Date.now() - start
    const isError = res.statusCode >= 400
    const route = req.route?.path ?? req.path

    if (req.path !== '/api/health') {
      metrics.record(route, durationMs, isError)
    }

    logger.info('request', {
      reqId,
      method: req.method,
      path: req.path,
      status: res.statusCode,
      durationMs,
    })
  })

  next()
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function getReqId(req: Request): string {
  return (req as Request & { reqId: string }).reqId ?? '?'
}

async function callGemini<T>(
  reqId: string,
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const t = Date.now()
  logger.info(`gemini:start`, { reqId, label })
  try {
    const result = await fn()
    logger.info(`gemini:ok`, { reqId, label, durationMs: Date.now() - t })
    return result
  } catch (err) {
    logger.error(`gemini:error`, {
      reqId,
      label,
      durationMs: Date.now() - t,
      error: err instanceof Error ? err.message : String(err),
    })
    throw err
  }
}

// ── Prompts ───────────────────────────────────────────────────────────────────
const ASSUMPTIONS_SYSTEM_PROMPT =
  'You are a startup analyst. Given a startup profile, identify key assumptions the founders are making. ' +
  'Return ONLY a JSON array, no markdown, no code fences.'

const assumptionsUserPrompt = (profile: object) =>
  `Given this startup profile, identify 5-8 key assumptions the founders are making. ` +
  `Return ONLY a JSON array where each item has: ` +
  `id (string), category (one of: market, product, financial, team, competition), ` +
  `statement (string), riskLevel (one of: high, medium, low).\n\n` +
  `Startup profile:\n${JSON.stringify(profile, null, 2)}`

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

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', ...metrics.summary() })
})

app.post('/api/assumptions', async (req, res) => {
  const reqId = getReqId(req)
  try {
    const profile = req.body
    if (!profile || typeof profile !== 'object') {
      logger.warn('assumptions:invalid-body', { reqId })
      res.status(400).json({ error: 'Invalid profile body' })
      return
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await callGemini(reqId, 'assumptions', () =>
      model.generateContent({
        systemInstruction: ASSUMPTIONS_SYSTEM_PROMPT,
        contents: [{ role: 'user', parts: [{ text: assumptionsUserPrompt(profile) }] }],
      })
    )

    const raw = result.response.text()
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const assumptions = JSON.parse(cleaned)
    logger.info('assumptions:success', { reqId, count: Array.isArray(assumptions) ? assumptions.length : null })
    res.json(assumptions)
  } catch (err) {
    logger.error('assumptions:error', {
      reqId,
      error: err instanceof Error ? err.message : String(err),
    })
    res.status(500).json({ error: 'Failed to extract assumptions' })
  }
})

app.post('/api/scenarios', async (req, res) => {
  const reqId = getReqId(req)
  try {
    const { profile, assumptions } = req.body
    if (!profile || !Array.isArray(assumptions)) {
      logger.warn('scenarios:invalid-body', { reqId })
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await callGemini(reqId, 'scenarios', () =>
      model.generateContent({
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
    )

    const raw = result.response.text()
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed = JSON.parse(cleaned)

    if (!Array.isArray(parsed) || parsed.length !== 3) {
      logger.warn('scenarios:unexpected-shape', { reqId, count: Array.isArray(parsed) ? parsed.length : 'non-array' })
      res.status(500).json({ error: `Expected 3 scenarios, got ${Array.isArray(parsed) ? parsed.length : 'non-array'}` })
      return
    }

    logger.info('scenarios:success', { reqId, count: parsed.length })
    res.json(parsed)
  } catch (err) {
    logger.error('scenarios:error', {
      reqId,
      error: err instanceof Error ? err.message : String(err),
    })
    res.status(500).json({ error: 'Failed to generate failure scenarios' })
  }
})

app.post(
  '/api/analyze',
  upload.fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'images', maxCount: 5 },
  ]),
  async (req, res) => {
    const reqId = getReqId(req)
    try {
      const text: string = req.body.text ?? ''
      const files = req.files as Record<string, Express.Multer.File[]> | undefined

      const pdfFiles = files?.['pdf'] ?? []
      const imageFiles = files?.['images'] ?? []
      logger.info('analyze:inputs', { reqId, hasText: text.trim().length > 0, pdfs: pdfFiles.length, images: imageFiles.length })

      const parts: Part[] = []
      if (text.trim()) parts.push({ text })
      if (pdfFiles.length > 0) {
        parts.push({ inlineData: { data: pdfFiles[0].buffer.toString('base64'), mimeType: 'application/pdf' } })
      }
      for (const img of imageFiles) {
        parts.push({ inlineData: { data: img.buffer.toString('base64'), mimeType: img.mimetype } })
      }

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
      const result = await callGemini(reqId, 'analyze', () =>
        model.generateContent({
          systemInstruction: SYSTEM_PROMPT,
          contents: [{ role: 'user', parts }],
        })
      )

      const raw = result.response.text()
      const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
      const profile = JSON.parse(cleaned)
      logger.info('analyze:success', { reqId, startupName: profile?.name })
      res.json(profile)
    } catch (err) {
      logger.error('analyze:error', {
        reqId,
        error: err instanceof Error ? err.message : String(err),
      })
      res.status(500).json({ error: 'Failed to analyze startup profile' })
    }
  }
)

type FailureScenario = {
  title: string
  rootCause: string
  timeline: { month: number; headline: string }[]
}

async function serverGenerateImage(scenario: FailureScenario, reqId: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as never,
    })
    const prompt = `Generate a dark, cinematic, editorial-style documentary photograph representing this startup failure: ${scenario.title}. Context: ${scenario.rootCause}. Style: dramatic lighting, moody, photojournalistic.`
    const result = await callGemini(reqId, 'scenario-image', () => model.generateContent(prompt))
    for (const part of result.response.candidates?.[0]?.content?.parts ?? []) {
      const p = part as { inlineData?: { mimeType: string; data: string } }
      if (p.inlineData) return `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`
    }
    logger.warn('scenario-image:no-image-part', { reqId })
    return null
  } catch {
    return null
  }
}

async function serverGenerateNarration(scenario: FailureScenario, reqId: string): Promise<{ audioBase64: string; narrationText: string } | null> {
  try {
    const ttsPrompt = `Narrate the following startup failure scenario in a serious, reflective documentary tone like a Netflix narrator. Speak in second person to the founder. Keep it under 80 words.\n\nTitle: ${scenario.title}\nRoot cause: ${scenario.rootCause}\nTimeline: ${scenario.timeline.map(t => t.headline).join(' → ')}`

    const ttsModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-tts',
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      } as never,
    })
    const ttsResult = await callGemini(reqId, 'scenario-tts', () => ttsModel.generateContent(ttsPrompt))

    let audioBase64: string | null = null
    for (const part of ttsResult.response.candidates?.[0]?.content?.parts ?? []) {
      const p = part as { inlineData?: { mimeType: string; data: string } }
      if (p.inlineData) { audioBase64 = `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`; break }
    }
    if (!audioBase64) {
      logger.warn('scenario-tts:no-audio-part', { reqId })
      return null
    }

    const textPrompt = `Write a 4-5 sentence documentary narrator voiceover script for this startup failure scenario. Title: ${scenario.title}. Root cause: ${scenario.rootCause}. Timeline summary: ${scenario.timeline.map(t => t.headline).join(' → ')}. Use a serious, reflective tone like a Netflix documentary narrator. Speak in second person to the founder. Keep it under 80 words. Return only the narration text, no formatting.`
    const textModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const textResult = await callGemini(reqId, 'scenario-narration-text', () => textModel.generateContent(textPrompt))
    const narrationText = textResult.response.text()

    return { audioBase64, narrationText }
  } catch {
    return null
  }
}

app.post('/api/scenario-media', async (req, res) => {
  const reqId = getReqId(req)
  try {
    const scenario = req.body as FailureScenario
    if (!scenario?.title || !scenario?.rootCause) {
      logger.warn('scenario-media:invalid-body', { reqId })
      res.status(400).json({ error: 'Invalid scenario body' })
      return
    }

    logger.info('scenario-media:start', { reqId, title: scenario.title })
    const [image, narration] = await Promise.all([
      serverGenerateImage(scenario, reqId),
      serverGenerateNarration(scenario, reqId),
    ])

    logger.info('scenario-media:success', { reqId, hasImage: !!image, hasNarration: !!narration })
    res.json({ image, narration })
  } catch (err) {
    logger.error('scenario-media:error', {
      reqId,
      error: err instanceof Error ? err.message : String(err),
    })
    res.status(500).json({ error: 'Failed to generate scenario media' })
  }
})

app.use(express.static('dist'))

app.get('/{*path}', (_req, res) => {
  res.sendFile('index.html', { root: 'dist' })
})

app.listen(PORT, () => {
  logger.info('server:start', { port: PORT, allowedOrigins: ALLOWED_ORIGINS })
})
