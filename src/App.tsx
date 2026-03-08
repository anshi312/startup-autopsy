import { useState } from 'react'
import TextInput from './components/TextInput'
import PdfUpload from './components/PdfUpload'
import ImageUpload from './components/ImageUpload'
import ProfileCard from './components/ProfileCard'
import AssumptionList from './components/AssumptionList'
import ScenarioList from './components/ScenarioList'
import { extractStartupProfile } from './services/extractProfile'
import { extractAssumptions } from './services/extractAssumptions'
import { generateFailureScenarios } from './services/generateScenarios'
import type { StartupProfile, Assumption, FailureScenario } from './types'

type Step = 'input' | 'profile' | 'assumptions' | 'results'

function App() {
  const [textInput, setTextInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [profile, setProfile] = useState<StartupProfile | null>(null)
  const [assumptions, setAssumptions] = useState<Assumption[]>([])
  const [scenarios, setScenarios] = useState<FailureScenario[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [isExtractingAssumptions, setIsExtractingAssumptions] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [step, setStep] = useState<Step>('input')

  const canSubmit =
    !isExtracting &&
    (textInput.trim().length > 0 || pdfFile !== null || imageFiles.length > 0)

  async function handleSubmit() {
    setIsExtracting(true)
    try {
      const result = await extractStartupProfile(textInput, pdfFile, imageFiles)
      setProfile(result)
      setStep('profile')
    } catch (err) {
      console.error('Autopsy failed:', err)
    } finally {
      setIsExtracting(false)
    }
  }

  async function handleContinue() {
    if (!profile) return
    setIsExtractingAssumptions(true)
    try {
      const result = await extractAssumptions(profile)
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
      const result = await generateFailureScenarios(profile, assumptions)
      setScenarios(result)
      setStep('results')
    } catch (err) {
      console.error('Scenario generation failed:', err)
      alert('Failed to generate failure scenarios. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          💀 Startup Autopsy
        </h1>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        {step === 'input' && (
          <div className="w-full max-w-2xl flex flex-col gap-6">
            <TextInput value={textInput} onChange={setTextInput} />
            <PdfUpload onChange={setPdfFile} />
            <ImageUpload onChange={setImageFiles} />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-colors
                ${canSubmit
                  ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isExtracting ? 'Analyzing...' : 'Run Autopsy'}
            </button>
          </div>
        )}

        {step === 'profile' && profile && (
          <div className="w-full max-w-2xl flex flex-col gap-4">
            <ProfileCard profile={profile} onUpdate={setProfile} />
            <button
              type="button"
              onClick={handleContinue}
              disabled={isExtractingAssumptions}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-colors
                ${isExtractingAssumptions
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                }`}
            >
              {isExtractingAssumptions ? 'Analyzing assumptions...' : 'Continue →'}
            </button>
          </div>
        )}

        {step === 'assumptions' && (
          <div className="w-full max-w-2xl flex flex-col gap-4">
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
            <button
              type="button"
              onClick={handleGenerateScenarios}
              disabled={assumptions.length < 3 || isGenerating}
              className={`w-full py-3 rounded-lg font-bold text-sm transition-colors
                ${assumptions.length >= 3 && !isGenerating
                  ? 'bg-red-600 hover:bg-red-500 text-white cursor-pointer'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
            >
              {isGenerating ? 'Generating scenarios...' : 'Generate Failure Scenarios'}
            </button>
          </div>
        )}

        {step === 'results' && (
          <ScenarioList scenarios={scenarios} />
        )}
      </main>
    </div>
  )
}

export default App
