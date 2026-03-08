import type { FailureScenario } from '../types'

interface Props {
  scenarios: FailureScenario[]
  onBack: () => void
}

export default function SummaryView({ scenarios, onBack }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Action Plan Summary</h2>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Scenarios
        </button>
      </div>

      <div className="flex flex-col divide-y divide-gray-700">
        {scenarios.map((scenario, i) => (
          <div key={i} className="px-6 py-5">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
                {i + 1}
              </span>
              <h3 className="text-base font-bold text-white leading-snug">{scenario.title}</h3>
            </div>

            <div className="ml-9 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <span className="text-base leading-none shrink-0">📋</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-400 mb-1">
                    What To Test Now
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">{scenario.validationStep}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base leading-none shrink-0">💡</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-400 mb-1">
                    Pivot Idea
                  </p>
                  <p className="text-sm text-gray-300 leading-relaxed">{scenario.pivotSuggestion}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
