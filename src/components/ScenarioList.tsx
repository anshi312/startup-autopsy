import type { FailureScenario } from '../types'

interface ScenarioListProps {
  scenarios: FailureScenario[]
}

const severityStyle: Record<FailureScenario['severity'], { badge: string; border: string; glow: string }> = {
  catastrophic: {
    badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
    border: 'border-red-500/40',
    glow: 'shadow-red-900/20',
  },
  severe: {
    badge: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    border: 'border-orange-500/40',
    glow: 'shadow-orange-900/20',
  },
  moderate: {
    badge: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    border: 'border-yellow-500/40',
    glow: 'shadow-yellow-900/20',
  },
}

const failureTypeTag: Record<FailureScenario['failureType'], string> = {
  market:      'bg-blue-500/15 text-blue-400',
  execution:   'bg-purple-500/15 text-purple-400',
  competition: 'bg-rose-500/15 text-rose-400',
  financial:   'bg-emerald-500/15 text-emerald-400',
  team:        'bg-orange-500/15 text-orange-400',
}

function ScenarioCard({ scenario, index }: { scenario: FailureScenario; index: number }) {
  const sev = severityStyle[scenario.severity]

  return (
    <div className={`rounded-xl bg-gray-800 border ${sev.border} shadow-lg ${sev.glow} flex flex-col gap-5 p-6`}>
      {/* Header */}
      <div className="flex items-start gap-3 flex-wrap">
        <span className="text-gray-500 font-mono text-xs pt-0.5 shrink-0">#{index + 1}</span>
        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-base leading-snug">{scenario.title}</h2>
          <p className="text-gray-400 text-sm mt-1 leading-relaxed">{scenario.rootCause}</p>
        </div>
        <div className="flex gap-2 flex-wrap shrink-0">
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${failureTypeTag[scenario.failureType]}`}>
            {scenario.failureType}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${sev.badge}`}>
            {scenario.severity}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Timeline</h3>
        <div className="flex flex-col gap-0">
          {scenario.timeline.map((event, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-gray-600 mt-1.5 shrink-0" />
                {i < scenario.timeline.length - 1 && (
                  <div className="w-px flex-1 bg-gray-700 my-1" />
                )}
              </div>
              <div className="pb-4">
                <span className="text-xs text-gray-500 font-mono">Month {event.month}</span>
                <p className="text-sm text-white font-semibold leading-snug mt-0.5">{event.headline}</p>
                <p className="text-xs text-gray-400 leading-relaxed mt-1">{event.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Early Warnings */}
      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Early Warning Signs</h3>
        <ul className="flex flex-col gap-1.5">
          {scenario.earlyWarnings.map((warning, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
              <span className="text-yellow-500 mt-0.5 shrink-0">⚠</span>
              {warning}
            </li>
          ))}
        </ul>
      </div>

      {/* Quote */}
      <blockquote className="border-l-2 border-gray-600 pl-4">
        <p className="text-sm text-gray-300 italic leading-relaxed">"{scenario.quote.text}"</p>
        <footer className="text-xs text-gray-500 mt-1.5">— {scenario.quote.attribution}</footer>
      </blockquote>

      {/* Pivot & Validation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-lg bg-gray-700/50 border border-gray-600/50 px-4 py-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Pivot Suggestion</h4>
          <p className="text-sm text-gray-200 leading-relaxed">{scenario.pivotSuggestion}</p>
        </div>
        <div className="rounded-lg bg-gray-700/50 border border-gray-600/50 px-4 py-3">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Validation Step</h4>
          <p className="text-sm text-gray-200 leading-relaxed">{scenario.validationStep}</p>
        </div>
      </div>
    </div>
  )
}

export default function ScenarioList({ scenarios }: ScenarioListProps) {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-white">Failure Scenarios</h2>
        <p className="text-sm text-gray-400 mt-1">
          {scenarios.length} scenarios generated — here's how this startup could fail.
        </p>
      </div>
      {scenarios.map((s, i) => (
        <ScenarioCard key={i} scenario={s} index={i} />
      ))}
    </div>
  )
}
