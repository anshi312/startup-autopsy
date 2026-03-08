import { useState } from 'react'
import type { FailureScenario } from '../types'

const SEVERITY_COLORS: Record<FailureScenario['severity'], string> = {
  catastrophic: 'bg-red-600 text-white',
  severe: 'bg-orange-500 text-white',
  moderate: 'bg-amber-400 text-amber-900',
}

const FAILURE_TYPE_COLORS: Record<FailureScenario['failureType'], string> = {
  market: 'bg-blue-100 text-blue-700',
  execution: 'bg-violet-100 text-violet-700',
  competition: 'bg-cyan-100 text-cyan-700',
  financial: 'bg-emerald-100 text-emerald-700',
  team: 'bg-pink-100 text-pink-700',
}

interface Props {
  scenario: FailureScenario
  imageUrl?: string | null
}

export default function ScenarioHeader({ scenario, imageUrl }: Props) {
  const [loaded, setLoaded] = useState(false)

  const badges = (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${FAILURE_TYPE_COLORS[scenario.failureType]}`}>
        {scenario.failureType}
      </span>
      <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide ${SEVERITY_COLORS[scenario.severity]}`}>
        {scenario.severity}
      </span>
    </div>
  )

  if (imageUrl) {
    return (
      <div className="relative w-full overflow-hidden" style={{ maxHeight: 300 }}>
        <img
          src={imageUrl}
          alt={scenario.title}
          onLoad={() => setLoaded(true)}
          className={`w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ maxHeight: 300 }}
        />
        {/* gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/60 to-gray-900" />
        {/* text content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 sm:px-6 pb-4 sm:pb-5 pt-8 sm:pt-12">
          {badges}
          <h2 className="mt-2 text-xl sm:text-2xl font-bold text-white leading-snug">
            {scenario.title}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#F9F8F5] border-b border-zinc-200 px-4 sm:px-6 py-5">
      {badges}
      <h2 className="mt-2 font-serif text-xl sm:text-2xl text-zinc-900 leading-snug">
        {scenario.title}
      </h2>
    </div>
  )
}
