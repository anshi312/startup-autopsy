import type { FailureScenario } from '../types'
import ScenarioHeader from './ScenarioHeader'
import NarrationPlayer from './NarrationPlayer'
import WarningSignals from './WarningSignals'
import Timeline from './Timeline'
import PullQuote from './PullQuote'
import SurvivalKit from './SurvivalKit'

type NarrationResult = { audioBase64: string; narrationText: string } | null

interface Props {
  scenario: FailureScenario
  imageUrl?: string | null
  narration?: NarrationResult
}

export default function ScenarioView({ scenario, imageUrl, narration }: Props) {
  return (
    <div className="flex flex-col">
      <ScenarioHeader scenario={scenario} imageUrl={imageUrl} />

      <div className="flex flex-col gap-6 px-4 sm:px-6 py-6">
        {narration && (
          <NarrationPlayer
            audioUrl={narration.audioBase64}
            narrationText={narration.narrationText}
          />
        )}

        <WarningSignals earlyWarnings={scenario.earlyWarnings} />

        <Timeline timeline={scenario.timeline} />

        <PullQuote quote={scenario.quote} />

        <div className="bg-gray-800 rounded-lg px-5 py-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
            Risk Explanation
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            This scenario is driven by the breakdown of the{' '}
            <span className="text-white font-semibold">{scenario.failureType}</span>{' '}
            assumption: {scenario.rootCause}
          </p>
        </div>

        <SurvivalKit scenario={scenario} />
      </div>
    </div>
  )
}
