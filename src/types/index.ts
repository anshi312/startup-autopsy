export interface StartupProfile {
  name: string
  problem: string
  solution: string
  targetMarket: string
  businessModel: string
  revenueModel: string
  teamDescription: string
  stage: string
  uniqueInsight: string
}

export type AssumptionCategory = 'market' | 'product' | 'financial' | 'team' | 'competition'
export type RiskLevel = 'high' | 'medium' | 'low'

export interface Assumption {
  id: string
  category: AssumptionCategory
  statement: string
  riskLevel: RiskLevel
}

export interface FailureScenario {
  title: string
  rootCause: string
  severity: 'catastrophic' | 'severe' | 'moderate'
  failureType: 'market' | 'execution' | 'competition' | 'financial' | 'team'
  timeline: { month: number; headline: string; description: string }[]
  earlyWarnings: string[]
  quote: { text: string; attribution: string }
  pivotSuggestion: string
  validationStep: string
}
