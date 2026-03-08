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
    <div className="flex border-b border-gray-700 bg-gray-900">
      {scenarios.map((scenario, i) => {
        const isActive = i === activeIndex
        const label =
          scenario.title.length > 40
            ? scenario.title.slice(0, 40) + '…'
            : scenario.title

        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            className={`flex items-center gap-2 px-4 py-3 text-sm transition-colors flex-1 min-w-0
              ${isActive
                ? 'border-b-2 border-red-500 font-bold text-white'
                : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200'
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
