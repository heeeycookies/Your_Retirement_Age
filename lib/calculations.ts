export interface WizardInputs {
  currentAge: number
  retirementAge: number
  annualIncome: number
  currentSavings: number
  monthlyExpenses: number
  monthlySavings: number
}

export interface ScenarioResult {
  retireAtAge: number | null
  requiredMonthlySavings: number
  portfolioProjection: ProjectionRow[]
}

export interface ProjectionRow {
  year: number
  age: number
  portfolioValue: number
}

export interface CalculationResults {
  freedomNumber: number          // FIRE number: how much you need to retire forever
  currentProgress: number        // % of freedom number already saved
  requiredMonthlySavings: number // to retire by target age (7% return)
  requiredAnnualIncome: number   // minimum income needed
  projectedRetireAge: number | null // at current savings rate (7%)
  scenarios: {
    conservative: ScenarioResult
    moderate: ScenarioResult
    aggressive: ScenarioResult
  }
}

/** The "Freedom Number" — 25x annual retirement spend (4% safe withdrawal rule) */
export function getFreedomNumber(monthlyExpenses: number): number {
  // Assume retirement spending is 80% of current spending
  return monthlyExpenses * 12 * 0.8 * 25
}

/** Portfolio value after N years with monthly contributions */
function futureValue(
  presentValue: number,
  monthlyContribution: number,
  annualReturnPct: number,
  years: number
): number {
  const r = annualReturnPct / 100 / 12
  const n = years * 12
  if (r === 0) return presentValue + monthlyContribution * n
  const factor = Math.pow(1 + r, n)
  return presentValue * factor + monthlyContribution * ((factor - 1) / r)
}

/** Binary search: monthly savings needed to hit target in yearsTarget years */
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
  const pmt = (target - currentSavings * factor) * r / (factor - 1)
  return Math.max(0, pmt)
}

/** How many years until the portfolio reaches the target (returns null if never within 60yr) */
function yearsToTarget(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  target: number
): number | null {
  const r = annualReturnPct / 100 / 12
  let portfolio = currentSavings
  for (let month = 1; month <= 60 * 12; month++) {
    portfolio = portfolio * (1 + r) + monthlySavings
    if (portfolio >= target) return month / 12
  }
  return null
}

/** Build year-by-year projection rows */
function buildProjection(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  currentAge: number,
  maxYears: number
): ProjectionRow[] {
  const r = annualReturnPct / 100 / 12
  let portfolio = currentSavings
  const rows: ProjectionRow[] = []
  const startYear = new Date().getFullYear()
  for (let year = 1; year <= maxYears; year++) {
    for (let m = 0; m < 12; m++) {
      portfolio = portfolio * (1 + r) + monthlySavings
    }
    rows.push({ year: startYear + year, age: currentAge + year, portfolioValue: Math.round(portfolio) })
  }
  return rows
}

export function runCalculations(inputs: WizardInputs): CalculationResults {
  const { currentAge, retirementAge, annualIncome, currentSavings, monthlyExpenses, monthlySavings } = inputs
  const freedomNumber = getFreedomNumber(monthlyExpenses)
  const yearsToGoal = retirementAge - currentAge
  const maxYears = Math.min(60 - currentAge + currentAge, 80 - currentAge)

  const calcScenario = (returnPct: number): ScenarioResult => {
    const yrs = yearsToTarget(currentSavings, monthlySavings, returnPct, freedomNumber)
    const retireAtAge = yrs !== null ? Math.round(currentAge + yrs) : null
    const reqSavings = requiredMonthlySavings(currentSavings, freedomNumber, yearsToGoal, returnPct)
    const projection = buildProjection(currentSavings, monthlySavings, returnPct, currentAge, Math.min(maxYears, 50))
    return { retireAtAge, requiredMonthlySavings: Math.max(0, reqSavings), portfolioProjection: projection }
  }

  const moderate = calcScenario(7)
  const reqIncome = (moderate.requiredMonthlySavings + monthlyExpenses) * 12 / 0.7

  return {
    freedomNumber,
    currentProgress: Math.min(100, (currentSavings / freedomNumber) * 100),
    requiredMonthlySavings: moderate.requiredMonthlySavings,
    requiredAnnualIncome: Math.max(annualIncome, reqIncome),
    projectedRetireAge: moderate.retireAtAge,
    scenarios: {
      conservative: calcScenario(5),
      moderate,
      aggressive: calcScenario(9),
    },
  }
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${Math.round(n).toLocaleString()}`
}

export function formatFull(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`
}
