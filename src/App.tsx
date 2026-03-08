import { useState } from 'react'
import TextInput from './components/TextInput'
import PdfUpload from './components/PdfUpload'
import ImageUpload from './components/ImageUpload'

function App() {
  const [_pitchDeck, setPitchDeck] = useState<File | null>(null)
  const [_images, setImages] = useState<File[]>([])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <nav className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">
          💀 Startup Autopsy
        </h1>
      </nav>

      <main className="flex-1 flex items-start justify-center px-4 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <TextInput />
          <PdfUpload onChange={setPitchDeck} />
          <ImageUpload onChange={setImages} />
        </div>
      </main>
    </div>
  )
}

export default App
