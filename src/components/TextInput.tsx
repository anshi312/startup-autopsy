import { useState } from 'react'

const MAX_CHARS = 2000

export default function TextInput() {
  const [value, setValue] = useState('')

  return (
    <div className="flex flex-col gap-2 w-full">
      <label htmlFor="startup-idea" className="text-sm font-medium text-gray-300">
        Describe your startup idea
      </label>
      <textarea
        id="startup-idea"
        value={value}
        onChange={e => setValue(e.target.value)}
        maxLength={MAX_CHARS}
        rows={8}
        placeholder="e.g., We're building a marketplace for freelance chefs to cook in people's homes..."
        className="w-full rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      <p className={`text-xs text-right ${value.length >= MAX_CHARS ? 'text-red-400' : 'text-gray-500'}`}>
        {value.length} / {MAX_CHARS}
      </p>
    </div>
  )
}
