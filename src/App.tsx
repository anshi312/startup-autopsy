import { useState } from 'react'
import TextInput from './components/TextInput'
import PdfUpload from './components/PdfUpload'
import ImageUpload from './components/ImageUpload'

function App() {
  const [textInput, setTextInput] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [imageFiles, setImageFiles] = useState<File[]>([])

  const canSubmit = textInput.trim().length > 0 || pdfFile !== null || imageFiles.length > 0

  function handleSubmit() {
    console.log({ textInput, pdfFile, imageFiles })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          💀 Startup Autopsy
        </h1>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
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
            Run Autopsy
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
