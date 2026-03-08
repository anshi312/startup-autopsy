import type { FailureScenario } from '../types'

const SEVERITY_DOT: Record<FailureScenario['severity'], string> = {
  catastrophic: 'bg-red-500',
  severe: 'bg-orange-400',
  moderate: 'bg-yellow-400',
}

interface Props {
  scenarios: FailureScenario[]
  activeIndex: number
  onSelect: (index: number) => void
}

export default function ScenarioTabs({ scenarios, activeIndex, onSelect }: Props) {
  return (
    <div className="flex overflow-x-auto border-b border-zinc-200 bg-[#F9F8F5] scrollbar-none">
      {scenarios.map((scenario, i) => {
        const isActive = i === activeIndex
        const label =
          scenario.title.length > 30
            ? scenario.title.slice(0, 30) + '…'
            : scenario.title

        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors shrink-0 min-w-[120px]
              ${isActive
                ? 'border-b-2 border-red-600 font-semibold text-zinc-900 bg-white'
                : 'border-b-2 border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
          >
            <span
              className={`shrink-0 w-2 h-2 rounded-full ${SEVERITY_DOT[scenario.severity]}`}
            />
            <span className="truncate">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
