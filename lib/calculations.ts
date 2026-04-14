import { Currency, formatAmount, formatCompact } from './currency'

export type CalculationMode = 'quick' | 'detailed'

export interface WizardInputs {
  // ── Quick mode (always present) ─────────────────────────
  currentAge: number
  retirementAge: number
  annualIncome: number
  currentSavings: number          // liquid + invested savings (excl. locked retirement funds)
  monthlyExpenses: number
  monthlySavings: number

  // ── Detailed mode (optional) ─────────────────────────────
  annualSalaryGrowthPct?: number  // e.g. 3 → monthly savings grow 3%/yr
  annualExpenseGrowthPct?: number // e.g. 2 → expenses grow 2%/yr (lifestyle inflation)
  annualBonusLumpSum?: number     // extra one-time invest per year
  expectedReturnPct?: number      // overrides default 7% moderate scenario
  monthlyDebtPayments?: number    // student loan, car, credit card
  monthlyPensionIncome?: number   // CPF Life, Social Security, company pension at retirement
  retirementAccountBalance?: number    // CPF OA+SA, 401k, Super, RRSP — locked until accessAge
  retirementAccountAccessAge?: number  // age when locked funds become accessible (default 65)
  plannedMajorExpenses?: number        // one-time big expense (house, car, etc.)
  plannedMajorExpensesYear?: number    // years from now until the expense
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

export interface LockedAccount {
  balance: number
  accessAge: number
  projectedValue: number   // what it grows to by accessAge at 4% (conservative, CPF-like)
}

export interface CalculationResults {
  freedomNumber: number
  currentProgress: number
  requiredMonthlySavings: number
  requiredAnnualIncome: number
  projectedRetireAge: number | null
  debtImpactYears?: number          // years earlier if debt redirected to savings
  lockedAccount?: LockedAccount     // shown when retirement fund not accessible by goal age
  plannedExpenseAmount?: number     // echo back for display in results
  plannedExpenseYear?: number
  scenarios: {
    conservative: ScenarioResult
    moderate: ScenarioResult
    aggressive: ScenarioResult
  }
}

// ── Core math ─────────────────────────────────────────────

/** Freedom Number = 25× annual retirement spend (4% safe withdrawal rule).
 *  Retirement spend projected forward using expense growth rate, then assumed at 80%,
 *  minus any pension income. */
export function getFreedomNumber(
  monthlyExpenses: number,
  monthlyPension = 0,
  yearsToRetirement = 0,
  annualExpenseGrowthPct = 0,
): number {
  const projectedMonthly = monthlyExpenses * Math.pow(1 + annualExpenseGrowthPct / 100, yearsToRetirement)
  const netMonthly = Math.max(0, projectedMonthly * 0.8 - monthlyPension)
  return netMonthly * 12 * 25
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

/**
 * Simulates month-by-month growth, with optional salary growth applied annually
 * and a planned major expense deducted at the specified month.
 */
function yearsToTarget(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  target: number,
  annualBonus = 0,
  salaryGrowthPct = 0,
  plannedExpense = 0,
  plannedExpenseMonth = 0,
): number | null {
  const r = annualReturnPct / 100 / 12
  let portfolio = currentSavings
  let currentMonthly = monthlySavings
  let expenseApplied = false

  for (let month = 1; month <= 60 * 12; month++) {
    portfolio = portfolio * (1 + r) + currentMonthly
    if (month % 12 === 0) {
      portfolio += annualBonus
      if (salaryGrowthPct > 0) currentMonthly *= (1 + salaryGrowthPct / 100)
    }
    if (!expenseApplied && plannedExpense > 0 && plannedExpenseMonth > 0 && month >= plannedExpenseMonth) {
      portfolio = Math.max(0, portfolio - plannedExpense)
      expenseApplied = true
    }
    if (portfolio >= target) return month / 12
  }
  return null
}

/**
 * Builds a year-by-year projection, applying salary growth to monthly savings each year,
 * and deducting any planned major expense at the specified year.
 */
function buildProjection(
  currentSavings: number,
  monthlySavings: number,
  annualReturnPct: number,
  currentAge: number,
  maxYears: number,
  annualBonus = 0,
  salaryGrowthPct = 0,
  plannedExpense = 0,
  plannedExpenseYear = 0,
): ProjectionRow[] {
  const r = annualReturnPct / 100 / 12
  let portfolio = currentSavings
  let currentMonthly = monthlySavings
  const rows: ProjectionRow[] = []
  const startYear = new Date().getFullYear()
  let expenseApplied = false

  for (let year = 1; year <= maxYears; year++) {
    for (let m = 0; m < 12; m++) {
      portfolio = portfolio * (1 + r) + currentMonthly
    }
    portfolio += annualBonus
    if (salaryGrowthPct > 0) currentMonthly *= (1 + salaryGrowthPct / 100)
    if (!expenseApplied && plannedExpense > 0 && plannedExpenseYear > 0 && year >= plannedExpenseYear) {
      portfolio = Math.max(0, portfolio - plannedExpense)
      expenseApplied = true
    }
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
    annualSalaryGrowthPct = 0,
    annualExpenseGrowthPct = 0,
  } = inputs

  const pensionIncome    = inputs.monthlyPensionIncome ?? 0
  const debtPayments     = inputs.monthlyDebtPayments ?? 0
  const retirementBal    = inputs.retirementAccountBalance ?? 0
  const retirementAccess = inputs.retirementAccountAccessAge ?? 65
  const plannedExpense   = inputs.plannedMajorExpenses ?? 0
  const plannedExpYear   = inputs.plannedMajorExpensesYear ?? 0

  // If locked retirement fund is accessible by goal retirement age, count it in savings
  const effectiveCurrentSavings = retirementAccess <= retirementAge
    ? currentSavings + retirementBal
    : currentSavings

  // If NOT accessible by retirement goal, project what it will be worth at access age
  let lockedAccount: LockedAccount | undefined
  if (retirementBal > 0 && retirementAccess > retirementAge) {
    const yearsToAccess = Math.max(0, retirementAccess - currentAge)
    lockedAccount = {
      balance: retirementBal,
      accessAge: retirementAccess,
      projectedValue: Math.round(futureValue(retirementBal, 0, 4, yearsToAccess)),
    }
  }

  const yearsToGoal      = retirementAge - currentAge
  const maxYears         = Math.min(80 - currentAge, 55)
  const moderateReturn   = expectedReturnPct ?? 7

  // Freedom Number projects expenses forward to retirement date using lifestyle inflation
  const freedomNumber = getFreedomNumber(monthlyExpenses, pensionIncome, yearsToGoal, annualExpenseGrowthPct)

  const plannedExpMonth = plannedExpYear > 0 ? Math.round(plannedExpYear * 12) : 0

  const calcScenario = (returnPct: number): ScenarioResult => {
    const yrs = yearsToTarget(
      effectiveCurrentSavings, monthlySavings, returnPct,
      freedomNumber, annualBonusLumpSum, annualSalaryGrowthPct,
      plannedExpense, plannedExpMonth,
    )
    const retireAtAge = yrs !== null ? Math.round(currentAge + yrs) : null
    const reqSavings  = requiredMonthlySavings(effectiveCurrentSavings, freedomNumber, yearsToGoal, returnPct)
    const projection  = buildProjection(
      effectiveCurrentSavings, monthlySavings, returnPct, currentAge,
      Math.min(maxYears, 50), annualBonusLumpSum, annualSalaryGrowthPct,
      plannedExpense, plannedExpYear,
    )
    return { retireAtAge, requiredMonthlySavings: Math.max(0, reqSavings), portfolioProjection: projection }
  }

  const moderate = calcScenario(moderateReturn)
  const reqIncome = (moderate.requiredMonthlySavings + monthlyExpenses) * 12 / 0.7

  // Debt impact: how many years earlier if debt cleared and redirected to savings
  let debtImpactYears: number | undefined
  if (debtPayments > 0) {
    const withDebt    = yearsToTarget(effectiveCurrentSavings, monthlySavings,                moderateReturn, freedomNumber, annualBonusLumpSum, annualSalaryGrowthPct, plannedExpense, plannedExpMonth)
    const withoutDebt = yearsToTarget(effectiveCurrentSavings, monthlySavings + debtPayments, moderateReturn, freedomNumber, annualBonusLumpSum, annualSalaryGrowthPct, plannedExpense, plannedExpMonth)
    if (withDebt !== null && withoutDebt !== null) {
      debtImpactYears = Math.round((withDebt - withoutDebt) * 10) / 10
    }
  }

  return {
    freedomNumber,
    currentProgress: Math.min(100, (effectiveCurrentSavings / freedomNumber) * 100),
    requiredMonthlySavings: moderate.requiredMonthlySavings,
    requiredAnnualIncome:   Math.max(annualIncome, reqIncome),
    projectedRetireAge:     moderate.retireAtAge,
    debtImpactYears,
    lockedAccount,
    plannedExpenseAmount: plannedExpense > 0 ? plannedExpense : undefined,
    plannedExpenseYear:   plannedExpense > 0 ? plannedExpYear : undefined,
    scenarios: {
      conservative: calcScenario(Math.max(1, moderateReturn - 2)),
      moderate,
      aggressive:   calcScenario(moderateReturn + 2),
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
  monthsEarlier: number
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
  const monthlyCost      = amount * FREQ_TO_MONTHLY[frequency]
  const annualCost       = monthlyCost * 12
  const compoundedValue  = futureValue(0, monthlyCost, returnPct, yearsToRetirement)
  const freedomNumberPct = (compoundedValue / freedomNumber) * 100
  const monthlyWithdrawal = (freedomNumber * 0.04) / 12
  const monthsEarlier     = Math.round(compoundedValue / monthlyWithdrawal)

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

// ── Formatting helpers ────────────────────────────────────
export { formatAmount, formatCompact }

export function formatFull(n: number, currency: Currency = 'USD'): string {
  return formatAmount(n, currency)
}
export function formatCurrency(n: number, currency: Currency = 'USD'): string {
  return formatCompact(n, currency)
}
