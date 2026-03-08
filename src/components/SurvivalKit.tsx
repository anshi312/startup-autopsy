import type { FailureScenario } from '../types'

interface Props {
  scenario: FailureScenario
}

export default function SurvivalKit({ scenario }: Props) {
  return (
    <div>
      <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        Survival Kit
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 border-l-4 border-green-500 pl-4 pr-4 py-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg leading-none">📋</span>
            <h4 className="text-sm font-bold text-green-400">What To Test Now</h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{scenario.validationStep}</p>
        </div>

        <div className="bg-gray-800 border-l-4 border-blue-500 pl-4 pr-4 py-4 rounded-r-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg leading-none">💡</span>
            <h4 className="text-sm font-bold text-blue-400">Pivot Idea</h4>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{scenario.pivotSuggestion}</p>
        </div>
      </div>
    </div>
  )
}
