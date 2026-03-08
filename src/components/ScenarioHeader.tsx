import { useState } from 'react'
import type { FailureScenario } from '../types'

const SEVERITY_COLORS: Record<FailureScenario['severity'], string> = {
  catastrophic: 'bg-red-600 text-white',
  severe: 'bg-orange-500 text-white',
  moderate: 'bg-yellow-500 text-black',
}

const FAILURE_TYPE_COLORS: Record<FailureScenario['failureType'], string> = {
  market: 'bg-blue-800 text-blue-200',
  execution: 'bg-purple-800 text-purple-200',
  competition: 'bg-cyan-800 text-cyan-200',
  financial: 'bg-emerald-800 text-emerald-200',
  team: 'bg-pink-800 text-pink-200',
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
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 pt-12">
          {badges}
          <h2 className="mt-2 text-2xl font-bold text-white leading-snug">
            {scenario.title}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 px-6 py-5">
      {badges}
      <h2 className="mt-2 text-2xl font-bold text-white leading-snug">
        {scenario.title}
      </h2>
    </div>
  )
}
