import { useState } from 'react'
import type { FailureScenario } from '../types'
import NarrationPlayer from './NarrationPlayer'

type NarrationResult = { audioBase64: string; narrationText: string } | null

interface ScenarioListProps {
  scenarios: FailureScenario[]
  images?: (string | null)[]
  narrations?: NarrationResult[]
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

function ScenarioCard({ scenario, index, image, narration }: { scenario: FailureScenario; index: number; image?: string | null; narration?: NarrationResult }) {
  const sev = severityStyle[scenario.severity]
  const [imgLoaded, setImgLoaded] = useState(false)

  const badges = (
    <div className="flex gap-2 flex-wrap shrink-0">
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${failureTypeTag[scenario.failureType]}`}>
        {scenario.failureType}
      </span>
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${sev.badge}`}>
        {scenario.severity}
      </span>
    </div>
  )

  return (
    <div className={`rounded-xl bg-gray-800 border ${sev.border} shadow-lg ${sev.glow} flex flex-col overflow-hidden`}>
      {/* Hero Header */}
      {image ? (
        <div className="relative">
          <img
            src={image}
            alt={scenario.title}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-40 sm:h-56 object-cover transition-opacity duration-700 ease-in ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          {/* gradient overlay: transparent → gray-800 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-800/50 to-gray-800" />
          {/* title text over image */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-8 flex items-end justify-between gap-3 flex-wrap">
            <div className="flex items-end gap-3 min-w-0 flex-1">
              <span className="text-gray-400 font-mono text-xs shrink-0 pb-0.5">#{index + 1}</span>
              <div className="min-w-0">
                <h2 className="text-white font-bold text-base leading-snug">{scenario.title}</h2>
                <p className="text-gray-300 text-sm mt-1 leading-relaxed">{scenario.rootCause}</p>
              </div>
            </div>
            {badges}
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3 flex-wrap px-6 pt-6">
          <span className="text-gray-500 font-mono text-xs pt-0.5 shrink-0">#{index + 1}</span>
          <div className="flex-1 min-w-0">
            <h2 className="text-white font-bold text-base leading-snug">{scenario.title}</h2>
            <p className="text-gray-400 text-sm mt-1 leading-relaxed">{scenario.rootCause}</p>
          </div>
          {badges}
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-5 px-6 pb-6 pt-5">
        {/* Narration */}
        {narration && (
          <NarrationPlayer
            audioUrl={narration.audioBase64}
            narrationText={narration.narrationText}
          />
        )}

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
    </div>
  )
}

export default function ScenarioList({ scenarios, images = [], narrations = [] }: ScenarioListProps) {
  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-bold text-white">Failure Scenarios</h2>
        <p className="text-sm text-gray-400 mt-1">
          {scenarios.length} scenarios generated — here's how this startup could fail.
        </p>
      </div>
      {scenarios.map((s, i) => (
        <ScenarioCard key={i} scenario={s} index={i} image={images[i]} narration={narrations[i]} />
      ))}
    </div>
  )
}
