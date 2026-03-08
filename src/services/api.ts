import type { StartupProfile, Assumption, FailureScenario } from '../types'

const BASE_URL = 'http://localhost:3001'

async function parseResponse<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error ?? `Request failed: ${res.status}`)
  return data as T
}

export async function analyzeStartup(
  text: string,
  pdfFile: File | null,
  imageFiles: File[],
): Promise<StartupProfile> {
  const form = new FormData()
  if (text.trim()) form.append('text', text)
  if (pdfFile) form.append('pdf', pdfFile)
  for (const img of imageFiles) form.append('images', img)

  const res = await fetch(`${BASE_URL}/api/analyze`, { method: 'POST', body: form })
  return parseResponse<StartupProfile>(res)
}

export async function getAssumptions(profile: StartupProfile): Promise<Assumption[]> {
  const res = await fetch(`${BASE_URL}/api/assumptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })
  return parseResponse<Assumption[]>(res)
}

export async function getScenarios(
  profile: StartupProfile,
  assumptions: Assumption[],
): Promise<FailureScenario[]> {
  const res = await fetch(`${BASE_URL}/api/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, assumptions }),
  })
  return parseResponse<FailureScenario[]>(res)
}

export async function getScenarioMedia(
  scenario: FailureScenario,
): Promise<{ image: string | null; narration: { audioBase64: string; narrationText: string } | null }> {
  const res = await fetch(`${BASE_URL}/api/scenario-media`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scenario),
  })
  return parseResponse(res)
}
