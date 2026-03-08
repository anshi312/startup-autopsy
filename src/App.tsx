import { useState } from 'react'
import TextInput from './components/TextInput'
import PdfUpload from './components/PdfUpload'
import ImageUpload from './components/ImageUpload'
import ProfileCard from './components/ProfileCard'
import AssumptionList from './components/AssumptionList'
import ScenarioTabs from './components/ScenarioTabs'
import ScenarioView from './components/ScenarioView'
import SummaryView from './components/SummaryView'
import { analyzeStartup, getAssumptions, getScenarios, getScenarioMedia } from './services/api'
import type { StartupProfile, Assumption, FailureScenario } from './types'

type NarrationResult = { audioBase64: string; narrationText: string } | null

type Step = 'input' | 'profile' | 'assumptions' | 'results'

function App() {
  const [textInput, setTextInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [profile, setProfile] = useState<StartupProfile | null>(null)
  const [assumptions, setAssumptions] = useState<Assumption[]>([])
  const [scenarios, setScenarios] = useState<FailureScenario[]>([])
  const [scenarioImages, setScenarioImages] = useState<(string | null)[]>([])
  const [scenarioNarrations, setScenarioNarrations] = useState<NarrationResult[]>([])
  const [isGeneratingImages, setIsGeneratingImages] = useState(false)
  const [isGeneratingNarrations, setIsGeneratingNarrations] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [isExtractingAssumptions, setIsExtractingAssumptions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<Step>('input')
  const [activeScenario, setActiveScenario] = useState(0)
  const [showSummary, setShowSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSubmit =
    !isExtracting &&
    (textInput.trim().length > 0 || pdfFile !== null || imageFiles.length > 0)

  async function handleSubmit() {
    setIsExtracting(true)
    setError(null)
    try {
      const result = await analyzeStartup(textInput, pdfFile, imageFiles)
      setProfile(result)
      setStep('profile')
    } catch (err) {
      console.error('Autopsy failed:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze startup. Please try again.')
    } finally {
      setIsExtracting(false)
    }
  }

  async function handleContinue() {
    if (!profile) return
    setIsExtractingAssumptions(true)
    try {
      const result = await getAssumptions(profile)
      setAssumptions(result)
      setStep('assumptions')
    } catch (err) {
      console.error('Assumptions extraction failed:', err)
      alert('Failed to extract assumptions. Please try again.')
    } finally {
      setIsExtractingAssumptions(false)
    }
  }

  async function handleGenerateScenarios() {
    if (!profile) return
    setIsGenerating(true)
    try {
      const result = await getScenarios(profile, assumptions)
      setScenarios(result)
      setStep('results')
      setIsGenerating(false)

      setIsGeneratingImages(true)
      setIsGeneratingNarrations(true)
      const mediaResults = await Promise.allSettled(result.map(s => getScenarioMedia(s)))
      const media = mediaResults.map(r => r.status === 'fulfilled' ? r.value : { image: null, narration: null })
      setScenarioImages(media.map(m => m.image))
      setScenarioNarrations(media.map(m => m.narration))
      setIsGeneratingImages(false)
      setIsGeneratingNarrations(false)
    } catch (err) {
      console.error('Scenario generation failed:', err)
      alert('Failed to generate failure scenarios. Please try again.')
    } finally {
      setIsGenerating(false)
      setIsGeneratingImages(false)
      setIsGeneratingNarrations(false)
    }
  }

  function handleReset() {
    setTextInput('')
    setPdfFile(null)
    setImageFiles([])
    setProfile(null)
    setAssumptions([])
    setScenarios([])
    setScenarioImages([])
    setScenarioNarrations([])
    setError(null)
    setShowSummary(false)
    setActiveScenario(0)
    setStep('input')
  }

  return (
    <div className="min-h-screen bg-[#F9F8F5] text-zinc-900 flex flex-col">
      <nav className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center">
        <button
          type="button"
          onClick={handleReset}
          className="font-serif text-xl tracking-tight text-zinc-900 hover:text-red-600 transition-colors cursor-pointer bg-transparent border-none p-0"
        >
          Startup Autopsy
        </button>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        {step === 'input' && (
          <div className="w-full max-w-2xl flex flex-col gap-5">
            <div className="mb-2">
              <h2 className="font-serif text-3xl text-zinc-900 mb-1">Diagnose your startup</h2>
              <p className="text-sm text-zinc-500">Describe your idea and we'll surface the failure scenarios you haven't considered yet.</p>
            </div>
            <TextInput value={textInput} onChange={setTextInput} />
            <PdfUpload onChange={setPdfFile} />
            <ImageUpload onChange={setImageFiles} />
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors
                ${canSubmit
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                }`}
            >
              {isExtracting ? 'Analyzing…' : 'Run Autopsy'}
            </button>
          </div>
        )}

        {step === 'profile' && profile && (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            <div className="mb-1">
              <h2 className="font-serif text-3xl text-zinc-900 mb-1">Startup Profile</h2>
              <p className="text-sm text-zinc-500">Review and refine what we extracted before generating assumptions.</p>
            </div>
            <ProfileCard profile={profile} onUpdate={setProfile} />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-colors bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
              >
                ← Back
              </button>
              {assumptions.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep('assumptions')}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-colors bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={isExtractingAssumptions}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors
                    ${isExtractingAssumptions
                      ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                    }`}
                >
                  {isExtractingAssumptions ? 'Analyzing assumptions…' : 'Continue →'}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'assumptions' && (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            <div className="mb-1">
              <h2 className="font-serif text-3xl text-zinc-900 mb-1">Key Assumptions</h2>
              <p className="text-sm text-zinc-500">These are the bets your startup is making. Edit, add, or remove before generating failure scenarios.</p>
            </div>
            <AssumptionList
              assumptions={assumptions}
              onUpdate={(id, updated) =>
                setAssumptions(prev => prev.map(a => a.id === id ? updated : a))
              }
              onRemove={id =>
                setAssumptions(prev => prev.filter(a => a.id !== id))
              }
              onAdd={assumption =>
                setAssumptions(prev => [...prev, assumption])
              }
            />
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('profile')}
                className="flex-1 py-3 rounded-lg font-semibold text-sm transition-colors bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
              >
                ← Back
              </button>
              {scenarios.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setStep('results')}
                  className="flex-1 py-3 rounded-lg font-semibold text-sm transition-colors bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 cursor-pointer"
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateScenarios}
                  disabled={assumptions.length < 3 || isGenerating}
                  className={`flex-1 py-3 rounded-lg font-semibold text-sm transition-colors
                    ${assumptions.length >= 3 && !isGenerating
                      ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                      : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                    }`}
                >
                  {isGenerating ? 'Generating scenarios…' : 'Generate Failure Scenarios'}
                </button>
              )}
            </div>
          </div>
        )}

        {step === 'results' && scenarios.length > 0 && (
          <div className="w-full max-w-4xl flex flex-col gap-4">
            {(isGeneratingImages || isGeneratingNarrations) && (
              <p className="text-center text-zinc-400 text-sm animate-pulse">
                Generating documentary visuals…
              </p>
            )}
            {showSummary ? (
              <SummaryView
                scenarios={scenarios}
                onBack={() => setShowSummary(false)}
              />
            ) : (
              <>
                <div className="bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                  <ScenarioTabs
                    scenarios={scenarios}
                    activeIndex={activeScenario}
                    onSelect={setActiveScenario}
                  />
                  <ScenarioView
                    scenario={scenarios[activeScenario]}
                    imageUrl={scenarioImages[activeScenario]}
                    narration={scenarioNarrations[activeScenario]}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep('assumptions')}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer shadow-sm"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSummary(true)}
                    className="flex-1 py-3 rounded-lg font-semibold text-sm bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer shadow-sm"
                  >
                    View Full Action Plan →
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default App
