import { useState } from 'react'
import type { Assumption, AssumptionCategory, RiskLevel } from '../types'

interface AssumptionListProps {
  assumptions: Assumption[]
  onUpdate: (id: string, updated: Assumption) => void
  onRemove: (id: string) => void
  onAdd: (assumption: Assumption) => void
}

const riskBadge: Record<RiskLevel, string> = {
  high:   'bg-red-50 text-red-600 border border-red-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low:    'bg-green-50 text-green-700 border border-green-200',
}

const riskActive: Record<RiskLevel, string> = {
  high:   'bg-red-600 text-white',
  medium: 'bg-amber-500 text-white',
  low:    'bg-green-600 text-white',
}

const categoryTag: Record<AssumptionCategory, string> = {
  market:      'bg-blue-50 text-blue-700',
  product:     'bg-violet-50 text-violet-700',
  financial:   'bg-emerald-50 text-emerald-700',
  team:        'bg-orange-50 text-orange-700',
  competition: 'bg-rose-50 text-rose-700',
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
      className={`rounded-lg bg-white border px-4 py-4 flex flex-col gap-2 transition-colors shadow-sm
        ${editing ? 'border-red-400 cursor-default' : 'border-zinc-200 cursor-pointer hover:border-zinc-300'}`}
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
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
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
          className="ml-auto text-zinc-300 hover:text-red-500 transition-colors text-base leading-none"
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
          className="w-full rounded-lg bg-white border border-zinc-300 text-zinc-900 text-sm px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      ) : (
        <p className="text-sm text-zinc-900 leading-relaxed">
          {assumption.statement || <span className="text-zinc-400 italic">Click to add statement...</span>}
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
        className="w-full py-2.5 rounded-lg border border-dashed border-zinc-300 text-zinc-500 hover:border-zinc-400 hover:text-zinc-700 text-sm transition-colors bg-white"
      >
        + Add Assumption
      </button>
    </div>
  )
}
