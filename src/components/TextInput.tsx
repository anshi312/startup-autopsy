const MAX_CHARS = 2000

interface TextInputProps {
  value: string
  onChange: (value: string) => void
}

export default function TextInput({ value, onChange }: TextInputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor="startup-idea" className="text-sm font-medium text-zinc-700">
        Describe your startup idea
      </label>
      <textarea
        id="startup-idea"
        value={value}
        onChange={e => onChange(e.target.value)}
        maxLength={MAX_CHARS}
        rows={8}
        placeholder="e.g., We're building a marketplace for freelance chefs to cook in people's homes..."
        className="w-full rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder-zinc-400 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
      />
      <p className={`text-xs text-right ${value.length >= MAX_CHARS ? 'text-red-500' : 'text-zinc-400'}`}>
        {value.length} / {MAX_CHARS}
      </p>
    </div>
  )
}
