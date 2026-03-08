// Image generation is handled server-side via Imagen on Vertex AI.
// See src/server/index.ts → serverGenerateImage() which uses:
//   genAI.preview.getImageGenerationModel({ model: 'imagen-3.0-fast-generate-001' })
// The frontend calls /api/scenario-media which invokes that function directly.
// This file is not called at runtime.

import type { FailureScenario } from '../types'

export async function generateScenarioImage(_scenario: FailureScenario): Promise<string | null> {
  throw new Error('Image generation is handled server-side via Imagen on Vertex AI.')
}
