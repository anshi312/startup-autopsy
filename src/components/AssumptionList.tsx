import { useState } from 'react'
import type { Assumption, AssumptionCategory, RiskLevel } from '../types'

interface AssumptionListProps {
  assumptions: Assumption[]
  onUpdate: (id: string, updated: Assumption) => void
  onRemove: (id: string) => void
  onAdd: (assumption: Assumption) => void
}

const riskBadge: Record<RiskLevel, string> = {
  high:   'bg-red-500/20 text-red-400 border border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low:    'bg-green-500/20 text-green-400 border border-green-500/30',
}

const riskActive: Record<RiskLevel, string> = {
  high:   'bg-red-500 text-white',
  medium: 'bg-yellow-500 text-gray-900',
  low:    'bg-green-500 text-white',
}

const categoryTag: Record<AssumptionCategory, string> = {
  market:      'bg-blue-500/15 text-blue-400',
  product:     'bg-purple-500/15 text-purple-400',
  financial:   'bg-emerald-500/15 text-emerald-400',
  team:        'bg-orange-500/15 text-orange-400',
  competition: 'bg-rose-500/15 text-rose-400',
}

interface CardProps {
  assumption: Assumption
  initialEditing?: boolean
  onUpdate: (updated: Assumption) => void
  onRemove: () => void
}

function AssumptionCard({ assumption, initialEditing = false, onUpdate, onRemove }: CardProps) {
  const [editing, setEditing] = useState(initialEditing)
  const [draft, setDraft] = useState(assumption)

  function handleClick() {
    if (!editing) {
      setDraft(assumption)
      setEditing(true)
    }
  }

  function handleRisk(level: RiskLevel) {
    const updated = { ...draft, riskLevel: level }
    setDraft(updated)
    onUpdate(updated)
  }

  function handleStatementBlur() {
    setEditing(false)
    onUpdate(draft)
  }

  return (
    <div
      onClick={handleClick}
      className={`rounded-lg bg-gray-800 border px-4 py-4 flex flex-col gap-2 transition-colors
        ${editing ? 'border-indigo-500 cursor-default' : 'border-gray-700 cursor-pointer hover:border-gray-500'}`}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${categoryTag[assumption.category]}`}>
          {assumption.category}
        </span>

        {editing ? (
          <div className="flex gap-1 ml-auto" onClick={e => e.stopPropagation()}>
            {(['high', 'medium', 'low'] as RiskLevel[]).map(level => (
              <button
                key={level}
                type="button"
                onClick={() => handleRisk(level)}
                className={`text-xs font-bold w-6 h-6 rounded transition-colors
                  ${draft.riskLevel === level
                    ? riskActive[level]
                    : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
              >
                {level[0].toUpperCase()}
              </button>
            ))}
          </div>
        ) : (
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${riskBadge[assumption.riskLevel]}`}>
            {assumption.riskLevel} risk
          </span>
        )}

        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove() }}
          aria-label="Remove assumption"
          className="ml-auto text-gray-600 hover:text-red-400 transition-colors text-base leading-none"
        >
          ✕
        </button>
      </div>

      {editing ? (
        <textarea
          autoFocus
          rows={3}
          value={draft.statement}
          onChange={e => setDraft(prev => ({ ...prev, statement: e.target.value }))}
          onBlur={handleStatementBlur}
          onClick={e => e.stopPropagation()}
          className="w-full rounded-lg bg-gray-700 border border-gray-600 text-white text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      ) : (
        <p className="text-sm text-white leading-relaxed">
          {assumption.statement || <span className="text-gray-500 italic">Click to add statement...</span>}
        </p>
      )}
    </div>
  )
}

let nextId = 1

export default function AssumptionList({ assumptions, onUpdate, onRemove, onAdd }: AssumptionListProps) {
  function handleAdd() {
    const newAssumption: Assumption = {
      id: `new-${nextId++}`,
      category: 'market',
      statement: '',
      riskLevel: 'medium',
    }
    onAdd(newAssumption)
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {assumptions.map((a, i) => (
        <AssumptionCard
          key={a.id}
          assumption={a}
          initialEditing={i === assumptions.length - 1 && a.id.startsWith('new-')}
          onUpdate={updated => onUpdate(a.id, updated)}
          onRemove={() => onRemove(a.id)}
        />
      ))}

      <button
        type="button"
        onClick={handleAdd}
        className="w-full py-2.5 rounded-lg border border-dashed border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300 text-sm transition-colors"
      >
        + Add Assumption
      </button>
    </div>
  )
}
