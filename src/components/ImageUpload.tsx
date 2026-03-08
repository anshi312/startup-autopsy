import { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react'

const MAX_IMAGES = 5
const ACCEPTED = ['image/png', 'image/jpeg']

interface ImageUploadProps {
  onChange: (files: File[]) => void
}

interface Preview {
  file: File
  url: string
}

export default function ImageUpload({ onChange }: ImageUploadProps) {
  const [previews, setPreviews] = useState<Preview[]>([])
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => previews.forEach(p => URL.revokeObjectURL(p.url))
  }, [previews])

  function addFiles(incoming: FileList | File[]) {
    const arr = Array.from(incoming)
    const valid = arr.filter(f => ACCEPTED.includes(f.type))

    if (valid.length < arr.length) {
      setError('Only PNG and JPG files are accepted.')
    } else {
      setError(null)
    }

    setPreviews(prev => {
      const remaining = MAX_IMAGES - prev.length
      if (remaining <= 0) {
        setError(`Maximum ${MAX_IMAGES} images allowed.`)
        return prev
      }
      const toAdd = valid.slice(0, remaining).map(file => ({
        file,
        url: URL.createObjectURL(file),
      }))
      if (valid.length > remaining) {
        setError(`Maximum ${MAX_IMAGES} images allowed. Only the first ${remaining} were added.`)
      }
      const next = [...prev, ...toAdd]
      onChange(next.map(p => p.file))
      return next
    })

    if (inputRef.current) inputRef.current.value = ''
  }

  function remove(index: number) {
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index].url)
      const next = prev.filter((_, i) => i !== index)
      onChange(next.map(p => p.file))
      setError(null)
      return next
    })
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) addFiles(e.target.files)
  }

  const atLimit = previews.length >= MAX_IMAGES

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-medium text-zinc-700">
        Screenshots / mockups{' '}
        <span className="text-zinc-400">(optional, up to {MAX_IMAGES})</span>
      </label>

      {previews.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {previews.map((p, i) => (
            <div key={p.url} className="relative shrink-0">
              <img
                src={p.url}
                alt={p.file.name}
                className="h-24 w-24 rounded-lg object-cover border border-zinc-200"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${p.file.name}`}
                className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-5 h-5 rounded-full bg-white border border-zinc-300 text-zinc-500 hover:text-red-500 hover:border-red-400 transition-colors text-xs leading-none shadow-sm"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {!atLimit && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 cursor-pointer transition-colors
            ${dragging
              ? 'border-red-400 bg-red-50'
              : 'border-zinc-300 hover:border-zinc-400 bg-white'
            }`}
        >
          <svg className="w-7 h-7 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <div className="text-center">
            <p className="text-sm text-zinc-700">
              Drop images here{' '}
              <span className="text-zinc-400">(PNG, JPG)</span>
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              or click to browse · {MAX_IMAGES - previews.length} remaining
            </p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={onFileChange}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
