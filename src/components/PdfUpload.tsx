import { useState, useRef, DragEvent, ChangeEvent } from 'react'

interface PdfUploadProps {
  onChange: (file: File | null) => void
}

export default function PdfUpload({ onChange }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function accept(incoming: File) {
    if (incoming.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    setError(null)
    setFile(incoming)
    onChange(incoming)
  }

  function remove() {
    setFile(null)
    setError(null)
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) accept(dropped)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0]
    if (picked) accept(picked)
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-zinc-700">
        Pitch deck <span className="text-zinc-400">(optional)</span>
      </label>

      {file ? (
        <div className="flex items-center justify-between rounded-lg bg-white border border-zinc-200 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <svg className="shrink-0 text-red-500 w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
            </svg>
            <span className="text-sm text-zinc-900 truncate">{file.name}</span>
          </div>
          <button
            type="button"
            onClick={remove}
            className="ml-4 shrink-0 text-zinc-400 hover:text-red-500 transition-colors text-sm"
            aria-label="Remove file"
          >
            Remove
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 cursor-pointer transition-colors
            ${dragging
              ? 'border-red-400 bg-red-50'
              : 'border-zinc-300 hover:border-zinc-400 bg-white'
            }`}
        >
          <svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
          </svg>
          <div className="text-center">
            <p className="text-sm text-zinc-700">Drop your pitch deck here <span className="text-zinc-400">(PDF)</span></p>
            <p className="text-xs text-zinc-400 mt-1">or click to browse</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onFileChange}
      />

      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  )
}
