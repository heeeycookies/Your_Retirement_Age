'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, DollarSign, PiggyBank, ShoppingBag, TrendingUp, TrendingDown, Calendar, BarChart2, Gift, CreditCard, Landmark, Vault, Home } from 'lucide-react'
import { WizardInputs, CalculationMode } from '@/lib/calculations'
import { Currency, getSymbol } from '@/lib/currency'
import { PixelSlider } from '@/components/ui/PixelSlider'

// Otter images cycle through each step: serious → shocked → happy → repeat
const STEP_OTTERS = ['/serious.png', '/shocked.png', '/happy.png'] as const

interface WizardFormProps {
  mode: CalculationMode
  currency: Currency
  onComplete: (inputs: WizardInputs) => void
}

// ── Step definitions ────────────────────────────────────

interface Preset {
  label: string
  value: number
  desc: string
}

interface StepDef {
  id: string
  icon: React.ElementType
  question: string
  hint: string
  inputType: 'number' | 'currency' | 'slider' | 'percent'
  placeholder?: string
  min: number
  max?: number
  step?: number
  defaultValue?: number
  suffix?: string
  presets?: Preset[]
  sliderZones?: Array<{ from: number; to: number; label: string; color: string }>
  validate: (val: number, inputs: Partial<WizardInputs>) => string | null
}

const QUICK_STEPS: StepDef[] = [
  {
    id: 'currentAge',
    icon: Calendar,
    question: 'How old are you right now?',
    hint: "Your age tells us how many years your savings have to grow before you stop working.",
    inputType: 'number',
    placeholder: '28',
    min: 16, max: 79,
    validate: v => (!v || v < 16 || v > 79) ? 'Enter an age between 16 and 79.' : null,
  },
  {
    id: 'retirementAge',
    icon: Calendar,
    question: 'What age do you want to retire?',
    hint: "Your dream retirement age — no wrong answer. Earlier just means saving a bit more each month.",
    inputType: 'number',
    placeholder: '50',
    min: 25, max: 90,
    validate: (v, inputs) => {
      if (!v || v < 25) return 'Must be at least 25.'
      if (inputs.currentAge && v <= inputs.currentAge) return `Must be older than ${inputs.currentAge}.`
      return null
    },
  },
  {
    id: 'annualIncome',
    icon: DollarSign,
    question: 'How much do you make per year?',
    hint: "Total before taxes — salary, freelance, bonuses, side hustles. If you have a partner and share expenses, you can include their income too. Enter 0 if between jobs.",
    inputType: 'currency',
    placeholder: '55,000',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter your income (0 if none).' : null,
  },
  {
    id: 'currentSavings',
    icon: PiggyBank,
    question: 'How much do you have saved or invested right now?',
    hint: "Include: bank savings you plan to invest, brokerage accounts, stocks, ETFs, bonds, CPF OA (Singapore), 401k / IRA (USA), Superannuation (Australia), RRSP / TFSA (Canada), ISA (UK). Don't include: home value, car, or locked funds you can't access by your retirement goal — add those separately below.",
    inputType: 'currency',
    placeholder: '10,000',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'monthlyExpenses',
    icon: ShoppingBag,
    question: 'How much do you spend each month?',
    hint: "Rent or mortgage, food, transport, subscriptions, going out — everything. This is used to estimate how much you'll need in retirement (we assume ~20% less once you stop working).",
    inputType: 'currency',
    placeholder: '2,500',
    min: 1,
    validate: v => (!v || v <= 0) ? 'Enter your monthly spending.' : null,
  },
]

const DETAILED_EXTRA_STEPS: StepDef[] = [
  {
    id: 'annualSalaryGrowthPct',
    icon: TrendingUp,
    question: 'How fast do you expect your income to grow each year?',
    hint: "Raises, promotions, growing your business — your savings contributions grow with your income. 2–4% is typical. 0% if you're on a fixed income or unsure. This is applied to your monthly savings each year.",
    inputType: 'slider',
    min: 0, max: 15, step: 0.5,
    defaultValue: 3,
    suffix: '%',
    sliderZones: [
      { from: 0,  to: 3,  label: 'Flat / stable', color: '#F0D9C4' },
      { from: 3,  to: 7,  label: 'Typical growth', color: '#C8E6C9' },
      { from: 7,  to: 15, label: 'High growth',    color: '#BBDEFB' },
    ],
    validate: v => (v < 0 || v > 15) ? 'Enter between 0% and 15%.' : null,
  },
  {
    id: 'annualExpenseGrowthPct',
    icon: TrendingDown,
    question: 'How much do you expect your expenses to grow each year?',
    hint: "Lifestyle inflation — spending tends to creep up as income rises. 2–3% tracks cost-of-living. 5%+ means significant lifestyle upgrades planned. This adjusts your Freedom Number to reflect what your life will actually cost at retirement, not just today.",
    inputType: 'slider',
    min: 0, max: 10, step: 0.5,
    defaultValue: 2,
    suffix: '%',
    sliderZones: [
      { from: 0, to: 2,  label: 'Frugal / fixed',  color: '#F0D9C4' },
      { from: 2, to: 5,  label: 'Typical',          color: '#C8E6C9' },
      { from: 5, to: 10, label: 'Lifestyle creep',  color: '#F4A7B9' },
    ],
    validate: v => (v < 0 || v > 10) ? 'Enter between 0% and 10%.' : null,
  },
  {
    id: 'annualBonusLumpSum',
    icon: Gift,
    question: 'Do you invest a lump sum each year?',
    hint: "Year-end bonus, tax refund, RSU / stock vest, dividend payout — any extra you invest once a year on top of your monthly savings. Enter 0 if none.",
    inputType: 'currency',
    placeholder: '0',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'expectedReturnPct',
    icon: BarChart2,
    question: 'What annual return do you expect on your investments?',
    hint: "Type any %, or pick a preset below. This is the annual growth rate applied to ALL your savings. For a mix of investments, use a weighted average (e.g. 50% in 4% bonds + 50% in 10% stocks = 7%). Crypto and high-risk assets can go much higher — but also much lower.",
    inputType: 'percent',
    placeholder: '7',
    min: 0.1,
    defaultValue: 7,
    suffix: '%',
    presets: [
      { label: 'Cash / FD',     value: 2.5, desc: 'savings account, fixed deposit' },
      { label: 'CPF / Bonds',   value: 4,   desc: 'government-backed funds' },
      { label: 'Index ETF',     value: 7,   desc: 'global index funds, 60/40' },
      { label: 'Growth stocks', value: 10,  desc: 'mostly equities, higher risk' },
      { label: 'Crypto / Alt',  value: 20,  desc: 'very high risk, very volatile' },
    ],
    validate: v => (!v || v <= 0) ? 'Enter a return rate above 0%.' : null,
  },
  {
    id: 'monthlyDebtPayments',
    icon: CreditCard,
    question: 'Do you have monthly debt repayments?',
    hint: "Student loans, car loan, credit card minimum payments — anything you're paying off monthly. Enter 0 if debt-free. We use this to show how much faster you could retire once the debt is cleared.",
    inputType: 'currency',
    placeholder: '0',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'monthlyPensionIncome',
    icon: Landmark,
    question: 'Do you expect a pension or government payout at retirement?',
    hint: "Any guaranteed monthly income at retirement that isn't from your own portfolio: CPF Life payouts (Singapore), Social Security (USA), Age Pension (Australia), State Pension (UK), company defined-benefit pension. This directly reduces your Freedom Number. Enter 0 if unsure.",
    inputType: 'currency',
    placeholder: '0',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'retirementAccountBalance',
    icon: Vault,
    question: 'Do you have money locked in a retirement fund?',
    hint: "Money you've saved that you can't freely withdraw yet: CPF SA (Singapore, locked until ~65), 401k / IRA before 59½ (USA), Superannuation before ~60 (Australia), RRSP before 71 (Canada), workplace pension. Enter the total balance. Enter 0 if already counted in your savings above.",
    inputType: 'currency',
    placeholder: '0',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'plannedMajorExpenses',
    icon: Home,
    question: 'Any big planned expenses before retirement?',
    hint: "House down payment, car purchase, renovation, wedding, starting a business, children's education — large one-time costs that'll reduce the money going toward retirement. Enter the total you plan to spend.",
    inputType: 'currency',
    placeholder: '0',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
]

export function WizardForm({ mode, currency, onComplete }: WizardFormProps) {
  const STEPS = mode === 'detailed'
    ? [...QUICK_STEPS, ...DETAILED_EXTRA_STEPS]
    : QUICK_STEPS

  const [stepIdx, setStepIdx]     = useState(0)
  const [values, setValues]       = useState<Record<string, string>>({
    expectedReturnPct: '7',  // pre-populate default so input shows it
  })
  const [sliderValues, setSliders]= useState<Record<string, number>>({
    annualSalaryGrowthPct:  3,
    annualExpenseGrowthPct: 2,
  })
  const [monthlySavings, setMonthlySavings]           = useState('')
  const [savingsErr, setSavingsErr]                   = useState('')
  const [retirementAccessAge, setRetirementAccessAge] = useState('65')
  const [accessAgeErr, setAccessAgeErr]               = useState('')
  const [plannedExpensesYear, setPlannedExpensesYear] = useState('5')
  const [plannedExpensesYearErr, setPlannedExpensesYearErr] = useState('')
  const [error, setError]                             = useState('')

  const step      = STEPS[stepIdx]
  const isLast    = stepIdx === STEPS.length - 1
  const otterSrc  = STEP_OTTERS[stepIdx % 3]
  const isExpensesStep          = step.id === 'monthlyExpenses'
  const isRetirementAccountStep = step.id === 'retirementAccountBalance'
  const isPlannedExpensesStep   = step.id === 'plannedMajorExpenses'
  const sym = getSymbol(currency)

  function getVal(id: string) { return values[id] ?? '' }

  function buildPartial(): Partial<WizardInputs> {
    return {
      currentAge:    values['currentAge']    ? parseInt(values['currentAge'])     : undefined,
      retirementAge: values['retirementAge'] ? parseInt(values['retirementAge'])  : undefined,
      annualIncome:  values['annualIncome']  ? parseFloat(values['annualIncome']) : undefined,
      currentSavings:values['currentSavings']? parseFloat(values['currentSavings']): undefined,
    }
  }

  function handleNext() {
    let val: number
    if (step.inputType === 'slider') {
      val = sliderValues[step.id] ?? step.defaultValue ?? step.min
    } else if (step.inputType === 'percent') {
      const raw = getVal(step.id)
      val = raw ? parseFloat(raw) : (step.defaultValue ?? step.min)
    } else {
      val = parseFloat((getVal(step.id) || '0').replace(/,/g, ''))
    }

    const err = step.validate(val, buildPartial())
    if (err) { setError(err); return }

    // Expenses step: also validate monthly savings sub-field
    if (isExpensesStep) {
      const ms = parseFloat(monthlySavings.replace(/,/g, ''))
      if (monthlySavings === '' || isNaN(ms) || ms < 0) {
        setSavingsErr('Enter how much you save per month (0 is fine).')
        return
      }
      setSavingsErr('')
    }

    // Retirement account step: also validate access age (only if balance > 0)
    if (isRetirementAccountStep && val > 0) {
      const age = parseInt(retirementAccessAge)
      if (!retirementAccessAge || isNaN(age) || age < 40 || age > 80) {
        setAccessAgeErr('Enter an age between 40 and 80.')
        return
      }
      setAccessAgeErr('')
    }

    // Planned expenses step: validate years if amount > 0
    if (isPlannedExpensesStep && val > 0) {
      const yrs = parseInt(plannedExpensesYear)
      if (!plannedExpensesYear || isNaN(yrs) || yrs < 1 || yrs > 40) {
        setPlannedExpensesYearErr('Enter a number between 1 and 40.')
        return
      }
      setPlannedExpensesYearErr('')
    }

    if (isLast) {
      const partial = buildPartial()
      const ms      = parseFloat(monthlySavings.replace(/,/g, ''))
      const rab     = parseFloat(getVal('retirementAccountBalance') || '0')
      const raa     = parseInt(retirementAccessAge) || 65
      const pe      = parseFloat(getVal('plannedMajorExpenses') || '0')
      const pey     = parseInt(plannedExpensesYear) || 5
      const retPct  = parseFloat(getVal('expectedReturnPct') || '7') || 7

      onComplete({
        currentAge:                  partial.currentAge!,
        retirementAge:               partial.retirementAge!,
        annualIncome:                partial.annualIncome!,
        currentSavings:              partial.currentSavings!,
        monthlyExpenses:             parseFloat(getVal('monthlyExpenses')),
        monthlySavings:              ms,
        annualSalaryGrowthPct:       mode === 'detailed' ? (sliderValues['annualSalaryGrowthPct'] ?? 3)  : undefined,
        annualExpenseGrowthPct:      mode === 'detailed' ? (sliderValues['annualExpenseGrowthPct'] ?? 2) : undefined,
        annualBonusLumpSum:          mode === 'detailed' ? (parseFloat(getVal('annualBonusLumpSum') || '0')) : undefined,
        expectedReturnPct:           mode === 'detailed' ? retPct : undefined,
        monthlyDebtPayments:         mode === 'detailed' ? (parseFloat(getVal('monthlyDebtPayments') || '0'))  : undefined,
        monthlyPensionIncome:        mode === 'detailed' ? (parseFloat(getVal('monthlyPensionIncome') || '0')) : undefined,
        retirementAccountBalance:    mode === 'detailed' && rab > 0 ? rab  : undefined,
        retirementAccountAccessAge:  mode === 'detailed' && rab > 0 ? raa  : undefined,
        plannedMajorExpenses:        mode === 'detailed' && pe > 0 ? pe  : undefined,
        plannedMajorExpensesYear:    mode === 'detailed' && pe > 0 ? pey : undefined,
      })
      return
    }

    setError('')
    setStepIdx(i => i + 1)
  }

  const progress = ((stepIdx + 1) / STEPS.length) * 100

  // For percent input — current numeric value for highlighting presets
  const currentReturnVal = parseFloat(getVal('expectedReturnPct') || '7') || 7

  return (
    <div
      className="min-h-[calc(100vh-65px)] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ background: '#FFF8F0' }}
    >
      {/* Pixel grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #3D2008 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      {/* Otter background */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none z-0 overflow-hidden" style={{ width: 260, height: 260 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={otterSrc}
          src={otterSrc}
          alt=""
          width={260}
          height={260}
          style={{ imageRendering: 'pixelated', opacity: 0.13, display: 'block' }}
        />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-lg bg-white border-4 border-[#3D2008] relative z-10"
        style={{ boxShadow: '8px 8px 0 #3D2008' }}
      >
        {/* Progress bar */}
        <div className="w-full h-2 bg-[#F0D9C4] border-b-2 border-[#3D2008]">
          <div
            className="h-full bg-[#E879A0] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-8 sm:p-10">
          {/* Icon + step count */}
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-9 h-9 bg-[#FFF0E8] border-2 border-[#D4B5A0] flex items-center justify-center"
              style={{ boxShadow: '2px 2px 0 #C68B57' }}
            >
              <step.icon className="w-4 h-4 text-[#C68B57]" strokeWidth={2} />
            </div>
            <span className="font-pixel text-[10px] text-[#9B8578] tracking-widest">
              Step {stepIdx + 1} of {STEPS.length}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3D2008] mb-3 leading-snug">
            {step.question}
          </h2>
          <p className="text-[#9B8578] text-sm leading-relaxed mb-7">{step.hint}</p>

          {/* Input */}
          {step.inputType === 'slider' ? (
            <PixelSlider
              value={sliderValues[step.id] ?? step.defaultValue ?? step.min}
              onChange={v => setSliders(s => ({ ...s, [step.id]: v }))}
              min={step.min}
              max={step.max!}
              step={step.step}
              valueSuffix={step.suffix}
              zones={step.sliderZones}
            />
          ) : step.inputType === 'percent' ? (
            /* ── Percent input with preset buttons ── */
            <div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={getVal(step.id)}
                  onChange={e => { setValues(p => ({ ...p, [step.id]: e.target.value })); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  placeholder={String(step.defaultValue ?? step.min)}
                  min={0}
                  inputMode="decimal"
                  className="w-full border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] text-2xl font-bold py-4 pl-4 pr-14 outline-none focus:bg-white transition-colors"
                  style={{ boxShadow: 'inset 3px 3px 0 #F0D9C4', appearance: 'none', MozAppearance: 'textfield' as never }}
                />
                <span className="absolute right-4 text-xl font-black text-[#9B8578] pointer-events-none select-none">%</span>
              </div>
              {/* Preset buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {step.presets!.map(preset => {
                  const isActive = Math.abs(currentReturnVal - preset.value) < 0.01
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => { setValues(p => ({ ...p, [step.id]: String(preset.value) })); setError('') }}
                      className="flex flex-col items-start px-3 py-2 border-2 border-[#3D2008] text-left transition-all"
                      style={{
                        background: isActive ? '#E879A0' : '#FFF0E8',
                        boxShadow: isActive ? '0 0 0 #3D2008' : '2px 2px 0 #3D2008',
                        color: isActive ? 'white' : '#3D2008',
                      }}
                    >
                      <span className="font-pixel text-[9px] tracking-wide">{preset.label} — {preset.value}%</span>
                      <span className="text-[10px] mt-0.5 opacity-70">{preset.desc}</span>
                    </button>
                  )
                })}
              </div>
              {currentReturnVal > 25 && (
                <p className="text-xs text-amber-600 border-l-4 border-amber-400 pl-3 mt-3">
                  {currentReturnVal}% is very high — great if it's accurate, but retirement projections at this rate assume sustained performance. Consider running a conservative scenario too.
                </p>
              )}
            </div>
          ) : (
            /* ── Currency / number input ── */
            <div>
              <div className="relative">
                {step.inputType === 'currency' && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9B8578] pointer-events-none">
                    {sym}
                  </span>
                )}
                <input
                  type="number"
                  value={getVal(step.id)}
                  onChange={e => { setValues(p => ({ ...p, [step.id]: e.target.value })); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  placeholder={step.placeholder}
                  min={step.min}
                  max={step.max}
                  inputMode="numeric"
                  className="w-full border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] text-2xl font-bold py-4 outline-none focus:bg-white transition-colors"
                  style={{
                    paddingLeft:  step.inputType === 'currency' ? '2.5rem' : '1rem',
                    paddingRight: '1rem',
                    boxShadow: 'inset 3px 3px 0 #F0D9C4',
                    appearance: 'none',
                    MozAppearance: 'textfield' as never,
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="text-sm font-semibold text-red-500 border-l-4 border-red-400 pl-3 mt-3">{error}</p>
          )}

          {/* Monthly savings sub-field (expenses step) */}
          {isExpensesStep && (
            <div className="mt-5 pt-5 border-t-2 border-dashed border-[#D4B5A0]">
              <label className="block text-sm font-bold text-[#3D2008] mb-1">
                How much do you set aside each month right now?
              </label>
              <p className="text-xs text-[#9B8578] mb-3">
                Any amount you actively save or invest monthly — bank transfer, CPF top-up, 401k contribution, index fund purchase. Enter 0 if you haven't started yet.
              </p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-[#9B8578]">{sym}</span>
                <input
                  type="number"
                  value={monthlySavings}
                  onChange={e => { setMonthlySavings(e.target.value); setSavingsErr('') }}
                  onKeyDown={e => e.key === 'Enter' && handleNext()}
                  placeholder="300"
                  min={0}
                  inputMode="numeric"
                  className="w-full border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] text-2xl font-bold py-4 pl-10 pr-4 outline-none focus:bg-white"
                  style={{ boxShadow: 'inset 3px 3px 0 #F0D9C4', appearance: 'none', MozAppearance: 'textfield' as never }}
                />
              </div>
              {savingsErr && (
                <p className="text-sm font-semibold text-red-500 border-l-4 border-red-400 pl-3 mt-2">{savingsErr}</p>
              )}
            </div>
          )}

          {/* Access age sub-field (retirement account step) */}
          {isRetirementAccountStep && (
            <div className="mt-5 pt-5 border-t-2 border-dashed border-[#D4B5A0]">
              <label className="block text-sm font-bold text-[#3D2008] mb-1">
                At what age can you access this money?
              </label>
              <p className="text-xs text-[#9B8578] mb-3">
                CPF full withdrawal: ~65 · 401k penalty-free: 59½ · Australian Super: ~60 · UK pension: 57+. If it's before your retirement goal, we count it toward your target.
              </p>
              <input
                type="number"
                value={retirementAccessAge}
                onChange={e => { setRetirementAccessAge(e.target.value); setAccessAgeErr('') }}
                placeholder="65"
                min={40}
                max={80}
                inputMode="numeric"
                className="w-full border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] text-2xl font-bold py-4 px-4 outline-none focus:bg-white"
                style={{ boxShadow: 'inset 3px 3px 0 #F0D9C4', appearance: 'none', MozAppearance: 'textfield' as never }}
              />
              {accessAgeErr && (
                <p className="text-sm font-semibold text-red-500 border-l-4 border-red-400 pl-3 mt-2">{accessAgeErr}</p>
              )}
            </div>
          )}

          {/* Years until expense sub-field (planned expenses step) */}
          {isPlannedExpensesStep && (
            <div className="mt-5 pt-5 border-t-2 border-dashed border-[#D4B5A0]">
              <label className="block text-sm font-bold text-[#3D2008] mb-1">
                How many years from now?
              </label>
              <p className="text-xs text-[#9B8578] mb-3">
                When do you expect to make this purchase? Closer expenses reduce your investable savings sooner and have more impact on your timeline.
              </p>
              <div className="relative flex items-center">
                <input
                  type="number"
                  value={plannedExpensesYear}
                  onChange={e => { setPlannedExpensesYear(e.target.value); setPlannedExpensesYearErr('') }}
                  placeholder="5"
                  min={1}
                  max={40}
                  inputMode="numeric"
                  className="w-full border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] text-2xl font-bold py-4 pl-4 pr-24 outline-none focus:bg-white"
                  style={{ boxShadow: 'inset 3px 3px 0 #F0D9C4', appearance: 'none', MozAppearance: 'textfield' as never }}
                />
                <span className="absolute right-4 text-sm font-bold text-[#9B8578] pointer-events-none">years</span>
              </div>
              {plannedExpensesYearErr && (
                <p className="text-sm font-semibold text-red-500 border-l-4 border-red-400 pl-3 mt-2">{plannedExpensesYearErr}</p>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <div className="flex justify-between items-center px-8 sm:px-10 pb-8 gap-4">
          <button
            onClick={() => { setError(''); setStepIdx(i => i - 1) }}
            disabled={stepIdx === 0}
            className="flex items-center gap-2 px-5 py-3 border-4 border-[#3D2008] bg-white text-[#3D2008] font-bold text-sm disabled:opacity-30"
            style={{ boxShadow: '3px 3px 0 #3D2008' }}
            onMouseDown={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0 0 0 #3D2008' }}
            onMouseUp={e   => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-7 py-3 border-4 border-[#3D2008] bg-[#E879A0] text-white font-pixel text-[10px] tracking-wide"
            style={{ boxShadow: '4px 4px 0 #3D2008' }}
            onMouseDown={e => (e.currentTarget.style.boxShadow = '0 0 0 #3D2008')}
            onMouseUp={e   => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
          >
            {isLast ? 'Show My Number' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mt-8 z-10 flex-wrap justify-center">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="border-2 border-[#3D2008] transition-all"
            style={{
              width: 11, height: 11,
              background: i < stepIdx ? '#E879A0' : i === stepIdx ? '#F4A7B9' : '#F0D9C4',
            }}
          />
        ))}
      </div>

    </div>
  )
}
