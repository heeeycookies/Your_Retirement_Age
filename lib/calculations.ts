import { Currency, formatAmount, formatCompact } from './currency'

export type CalculationMode = 'quick' | 'detailed'

export interface WizardInputs {
  // ── Quick mode (always present) ─────────────────────────
  currentAge: number
  retirementAge: number
  annualIncome: number
  currentSavings: number
  monthlyExpenses: number
  monthlySavings: number

  // ── Detailed mode (optional) ─────────────────────────────
  annualSalaryGrowthPct?: number  // e.g. 3 → 3%/yr
  annualBonusLumpSum?: number     // extra one-time invest per year
  expectedReturnPct?: number      // overrides default 7% moderate scenario
}

export interface ProjectionRow {
  year: number
  age: number
  portfolioValue: number
}

export interface ScenarioResult {
  retireAtAge: number | null
  requiredMonthlySavings: number
  portfolioProjection: ProjectionRow[]
}

export interface CalculationResults {
  freedomNumber: number
  currentProgress: number
  requiredMonthlySavings: number
  requiredAnnualIncome: number
  projectedRetireAge: number | null
  scenarios: {
    conservative: ScenarioResult
    moderate: ScenarioResult
    aggressive: ScenarioResult
  }
}

// ── Core math ─────────────────────────────────────────────

/** Freedom Number = 25× annual retirement spend (4% safe withdrawal rule).
 *  Retirement spend assumed at 80% of current monthly expenses. */
export function getFreedomNumber(monthlyExpenses: number): number {
  return monthlyExpenses * 12 * 0.8 * 25
}

function futureValue(
  pv: number,
  monthlyPmt: number,
  annualReturnPct: number,
  years: number
): number {
  const r = annualReturnPct / 100 / 12
  const n = years * 12
  if (r === 0) return pv + monthlyPmt * n
  const factor = Math.pow(1 + r, n)
  return pv * factor + monthlyPmt * ((factor - 1) / r)
}

export function requiredMonthlySavings(
  currentSavings: number,
  target: number,
  yearsTarget: number,
  annualReturnPct: number
): number {
  if (yearsTarget <= 0) return Infinity
  const r = annualReturnPct / 100 / 12
  const n = yearsTarget * 12
  const factor = Math.pow(1 + r, n)
  if (factor === 1) return (target - currentSavings) / n
  return Math.max(0, (target - currentSavings * factor) * r / (factor - 1))
}

function yearsToTarget(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  target: number,
  annualBonus = 0
): number | null {
  const r = annualReturnPct / 100 / 12
  let portfolio = currentSavings
  for (let month = 1; month <= 60 * 12; month++) {
    portfolio = portfolio * (1 + r) + monthlySavings
    // Add annual bonus once per year
    if (month % 12 === 0) portfolio += annualBonus
    if (portfolio >= target) return month / 12
  }
  return null
}

function buildProjection(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  currentAge: number,
  maxYears: number,
  annualBonus = 0
): ProjectionRow[] {
  const r = annualReturnPct / 100 / 12
  let portfolio = currentSavings
  const rows: ProjectionRow[] = []
  const startYear = new Date().getFullYear()
  for (let year = 1; year <= maxYears; year++) {
    for (let m = 0; m < 12; m++) {
      portfolio = portfolio * (1 + r) + monthlySavings
    }
    portfolio += annualBonus
    rows.push({ year: startYear + year, age: currentAge + year, portfolioValue: Math.round(portfolio) })
  }
  return rows
}

export function runCalculations(inputs: WizardInputs): CalculationResults {
  const {
    currentAge, retirementAge, annualIncome,
    currentSavings, monthlyExpenses, monthlySavings,
    annualBonusLumpSum = 0,
    expectedReturnPct,
  } = inputs

  const effectiveMonthly = monthlySavings + (annualBonusLumpSum / 12)
  const freedomNumber = getFreedomNumber(monthlyExpenses)
  const yearsToGoal = retirementAge - currentAge
  const maxYears = Math.min(80 - currentAge, 55)
  const moderateReturn = expectedReturnPct ?? 7

  const calcScenario = (returnPct: number): ScenarioResult => {
    const yrs = yearsToTarget(currentSavings, effectiveMonthly, returnPct, freedomNumber, annualBonusLumpSum)
    const retireAtAge = yrs !== null ? Math.round(currentAge + yrs) : null
    const reqSavings = requiredMonthlySavings(currentSavings, freedomNumber, yearsToGoal, returnPct)
    const projection = buildProjection(currentSavings, monthlySavings, returnPct, currentAge, Math.min(maxYears, 50), annualBonusLumpSum)
    return { retireAtAge, requiredMonthlySavings: Math.max(0, reqSavings), portfolioProjection: projection }
  }

  const moderate = calcScenario(moderateReturn)
  const reqIncome = (moderate.requiredMonthlySavings + monthlyExpenses) * 12 / 0.7

  return {
    freedomNumber,
    currentProgress: Math.min(100, (currentSavings / freedomNumber) * 100),
    requiredMonthlySavings: moderate.requiredMonthlySavings,
    requiredAnnualIncome: Math.max(annualIncome, reqIncome),
    projectedRetireAge: moderate.retireAtAge,
    scenarios: {
      conservative: calcScenario(Math.max(3, moderateReturn - 2)),
      moderate,
      aggressive: calcScenario(Math.min(12, moderateReturn + 2)),
    },
  }
}

// ── Guilty Pleasure calculator ────────────────────────────

export type GuiltyPleasureFrequency = 'daily' | 'weekly' | 'monthly'

export interface GuiltyPleasureResult {
  monthlyCost: number
  annualCost: number
  compoundedValue: number      // what that money grows to by retirement at 7%
  freedomNumberPct: number     // % of freedom number represented
  monthsEarlier: number        // rough months closer to retirement
  friendlyMessage: string
}

export function calcGuiltyPleasure(
  amount: number,
  frequency: GuiltyPleasureFrequency,
  yearsToRetirement: number,
  freedomNumber: number,
  returnPct = 7
): GuiltyPleasureResult {
  const FREQ_TO_MONTHLY: Record<GuiltyPleasureFrequency, number> = {
    daily: 30.44,
    weekly: 4.33,
    monthly: 1,
  }
  const monthlyCost = amount * FREQ_TO_MONTHLY[frequency]
  const annualCost = monthlyCost * 12
  const compoundedValue = futureValue(0, monthlyCost, returnPct, yearsToRetirement)
  const freedomNumberPct = (compoundedValue / freedomNumber) * 100
  // How many months of retirement income does this represent?
  const monthlyWithdrawal = (freedomNumber * 0.04) / 12
  const monthsEarlier = Math.round(compoundedValue / monthlyWithdrawal)

  let friendlyMessage: string
  if (monthsEarlier >= 24) {
    friendlyMessage = `Investing this instead could bring your retirement ${Math.round(monthsEarlier / 12)} years closer.`
  } else if (monthsEarlier >= 1) {
    friendlyMessage = `Investing this instead could bring your retirement ${monthsEarlier} month${monthsEarlier !== 1 ? 's' : ''} closer.`
  } else {
    friendlyMessage = `A small cost — but it adds up over time.`
  }

  return { monthlyCost, annualCost, compoundedValue, freedomNumberPct, monthsEarlier, friendlyMessage }
}

// ── Formatting helpers (re-exported for convenience) ──────
export { formatAmount, formatCompact }

/** Legacy helpers — kept for backward compat, default to USD */
export function formatFull(n: number, currency: Currency = 'USD'): string {
  return formatAmount(n, currency)
}
export function formatCurrency(n: number, currency: Currency = 'USD'): string {
  return formatCompact(n, currency)
}
