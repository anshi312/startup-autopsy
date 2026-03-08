import { useState } from 'react'
import TextInput from './components/TextInput'
import PdfUpload from './components/PdfUpload'
import ImageUpload from './components/ImageUpload'
import ProfileCard from './components/ProfileCard'
import { extractStartupProfile } from './services/extractProfile'
import type { StartupProfile } from './types'

type Step = 'input' | 'profile' | 'assumptions'

function App() {
  const [textInput, setTextInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [profile, setProfile] = useState<StartupProfile | null>(null)
  const [isExtracting, setIsExtracting] = useState(false)
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
              onClick={() => setStep('assumptions')}
              className="w-full py-3 rounded-lg font-bold text-sm bg-red-600 hover:bg-red-500 text-white transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 'assumptions' && (
          <div className="w-full max-w-2xl flex items-center justify-center py-24">
            <p className="text-gray-500 text-sm">Assumptions step coming soon...</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
