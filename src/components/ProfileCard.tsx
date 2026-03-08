import { useState } from 'react'
import type { StartupProfile } from '../types'

interface ProfileCardProps {
  profile: StartupProfile
  onUpdate: (updated: StartupProfile) => void
}

const FIELDS: { key: keyof StartupProfile; label: string; multiline?: boolean }[] = [
  { key: 'name',            label: 'Name' },
  { key: 'stage',           label: 'Stage' },
  { key: 'problem',         label: 'Problem',        multiline: true },
  { key: 'solution',        label: 'Solution',       multiline: true },
  { key: 'targetMarket',    label: 'Target Market',  multiline: true },
  { key: 'businessModel',   label: 'Business Model', multiline: true },
  { key: 'revenueModel',    label: 'Revenue Model',  multiline: true },
  { key: 'teamDescription', label: 'Team',           multiline: true },
  { key: 'uniqueInsight',   label: 'Unique Insight', multiline: true },
]

const inputClass =
  'w-full rounded-lg bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none'

export default function ProfileCard({ profile, onUpdate }: ProfileCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<StartupProfile>(profile)

  function handleEdit() {
    setDraft(profile)
    setEditing(true)
  }

  function handleSave() {
    onUpdate(draft)
    setEditing(false)
  }

  function handleCancel() {
    setDraft(profile)
    setEditing(false)
  }

  function set(key: keyof StartupProfile, value: string) {
    setDraft(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="w-full rounded-xl bg-gray-800 border border-gray-700 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          Startup Profile
        </h2>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors font-medium"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleEdit}
            className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {FIELDS.map(({ key, label, multiline }) => (
          <div key={key} className="flex flex-col gap-1">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              {label}
            </span>
            {editing ? (
              multiline ? (
                <textarea
                  rows={3}
                  value={draft[key]}
                  onChange={e => set(key, e.target.value)}
                  className={inputClass}
                />
              ) : (
                <input
                  type="text"
                  value={draft[key]}
                  onChange={e => set(key, e.target.value)}
                  className={inputClass}
                />
              )
            ) : (
              <p className="text-sm text-white leading-relaxed">
                {profile[key] || <span className="text-gray-600 italic">—</span>}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
