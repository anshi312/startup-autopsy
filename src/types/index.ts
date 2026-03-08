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
