import type { FailureScenario } from '../types'

interface Props {
  scenario: FailureScenario
}

export default function SurvivalKit({ scenario }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-3">
        Survival Kit
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-zinc-200 border-l-4 border-l-emerald-500 pl-4 pr-4 py-4 rounded-r-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg leading-none">📋</span>
            <h4 className="text-sm font-semibold text-emerald-700">What To Test Now</h4>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">{scenario.validationStep}</p>
        </div>

        <div className="bg-white border border-zinc-200 border-l-4 border-l-blue-500 pl-4 pr-4 py-4 rounded-r-lg shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg leading-none">💡</span>
            <h4 className="text-sm font-semibold text-blue-700">Pivot Idea</h4>
          </div>
          <p className="text-sm text-zinc-600 leading-relaxed">{scenario.pivotSuggestion}</p>
        </div>
      </div>
    </div>
  )
}
