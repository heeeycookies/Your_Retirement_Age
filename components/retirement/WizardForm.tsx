'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, DollarSign, PiggyBank, ShoppingBag, TrendingUp, Calendar, BarChart2, Gift, CreditCard, Landmark } from 'lucide-react'
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

interface StepDef {
  id: string
  icon: React.ElementType
  question: string
  hint: string
  inputType: 'number' | 'currency' | 'slider'
  placeholder?: string
  min: number
  max?: number
  step?: number
  defaultValue?: number
  suffix?: string
  sliderZones?: Array<{ from: number; to: number; label: string; color: string }>
  validate: (val: number, inputs: Partial<WizardInputs>) => string | null
}

const QUICK_STEPS: StepDef[] = [
  {
    id: 'currentAge',
    icon: Calendar,
    question: 'How old are you right now?',
    hint: "Your age helps us calculate how many years you have to grow your savings.",
    inputType: 'number',
    placeholder: '28',
    min: 16, max: 79,
    validate: v => (!v || v < 16 || v > 79) ? 'Enter an age between 16 and 79.' : null,
  },
  {
    id: 'retirementAge',
    icon: Calendar,
    question: 'What age do you want to retire?',
    hint: "Your goal — no wrong answer. Earlier just means saving a bit more each month.",
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
    hint: "Salary, freelance, side hustles — everything before taxes. Enter 0 if between jobs.",
    inputType: 'currency',
    placeholder: '55,000',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter your income (0 if none).' : null,
  },
  {
    id: 'currentSavings',
    icon: PiggyBank,
    question: 'How much have you saved so far?',
    hint: "Add up savings, 401k, Roth IRA, investments. Starting at zero? Totally fine.",
    inputType: 'currency',
    placeholder: '10,000',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'monthlyExpenses',
    icon: ShoppingBag,
    question: 'How much do you spend each month?',
    hint: "Rent, food, subscriptions, going out — everything. And below: how much you currently save.",
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
    question: 'How fast do you expect your salary to grow each year?',
    hint: "Even a modest raise adds up hugely over time. 2–4% is typical. 0% is fine if you're unsure.",
    inputType: 'slider',
    min: 0, max: 15, step: 0.5,
    defaultValue: 3,
    suffix: '%',
    sliderZones: [
      { from: 0,  to: 3,  label: 'Flat',       color: '#F0D9C4' },
      { from: 3,  to: 7,  label: 'Typical',     color: '#C8E6C9' },
      { from: 7,  to: 15, label: 'High Growth', color: '#BBDEFB' },
    ],
    validate: v => (v < 0 || v > 15) ? 'Enter between 0% and 15%.' : null,
  },
  {
    id: 'annualBonusLumpSum',
    icon: Gift,
    question: 'Do you get a bonus or invest a lump sum each year?',
    hint: "Year-end bonus you invest, tax refund, RSU vest — any extra beyond your monthly savings. Enter 0 if none.",
    inputType: 'currency',
    placeholder: '0',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'expectedReturnPct',
    icon: BarChart2,
    question: 'What annual return do you expect on your investments?',
    hint: "Global index funds have historically returned ~7% after inflation. Be realistic — higher returns come with more risk.",
    inputType: 'slider',
    min: 3, max: 12, step: 0.5,
    defaultValue: 7,
    suffix: '%',
    sliderZones: [
      { from: 3, to: 5,  label: 'Conservative', color: '#F0D9C4' },
      { from: 5, to: 9,  label: 'Moderate',      color: '#C8E6C9' },
      { from: 9, to: 12, label: 'Aggressive',    color: '#BBDEFB' },
    ],
    validate: v => (v < 3 || v > 12) ? 'Enter between 3% and 12%.' : null,
  },
  {
    id: 'monthlyDebtPayments',
    icon: CreditCard,
    question: 'Do you have monthly debt repayments?',
    hint: 'Student loans, car payments, credit cards — anything you pay off monthly. Enter 0 if debt-free.',
    inputType: 'currency',
    placeholder: '0',
    min: 0,
    validate: v => (isNaN(v) || v < 0) ? 'Enter 0 or more.' : null,
  },
  {
    id: 'monthlyPensionIncome',
    icon: Landmark,
    question: 'Do you expect any pension or government payout at retirement?',
    hint: "CPF Life, Social Security, company pension — any monthly income you'll receive at retirement that isn't from your own savings. Enter 0 if unsure.",
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
  const [values, setValues]       = useState<Record<string, string>>({})
  const [sliderValues, setSliders]= useState<Record<string, number>>({
    annualSalaryGrowthPct: 3,
    expectedReturnPct:     7,
  })
  const [monthlySavings, setMonthlySavings] = useState('')
  const [savingsErr, setSavingsErr]         = useState('')
  const [error, setError]                   = useState('')

  const step      = STEPS[stepIdx]
  const isLast    = stepIdx === STEPS.length - 1
  const otterSrc  = STEP_OTTERS[stepIdx % 3]
  const isExpensesStep = step.id === 'monthlyExpenses'
  const sym     = getSymbol(currency)

  function getVal(id: string) { return values[id] ?? '' }

  function buildPartial(): Partial<WizardInputs> {
    return {
      currentAge:    values['currentAge']    ? parseInt(values['currentAge'])    : undefined,
      retirementAge: values['retirementAge'] ? parseInt(values['retirementAge']) : undefined,
      annualIncome:  values['annualIncome']  ? parseFloat(values['annualIncome']) : undefined,
      currentSavings:values['currentSavings']? parseFloat(values['currentSavings']): undefined,
    }
  }

  function handleNext() {
    let val: number
    if (step.inputType === 'slider') {
      val = sliderValues[step.id] ?? step.defaultValue ?? step.min
    } else {
      val = parseFloat((getVal(step.id) || '0').replace(/,/g, ''))
    }

    const err = step.validate(val, buildPartial())
    if (err) { setError(err); return }

    // On expenses step also validate monthlySavings field
    if (isExpensesStep) {
      const ms = parseFloat(monthlySavings.replace(/,/g, ''))
      if (monthlySavings === '' || isNaN(ms) || ms < 0) {
        setSavingsErr('Enter how much you save per month (0 is fine).')
        return
      }
      setSavingsErr('')
    }

    if (isLast) {
      const partial = buildPartial()
      const ms = parseFloat(monthlySavings.replace(/,/g, ''))
      onComplete({
        currentAge:             partial.currentAge!,
        retirementAge:          partial.retirementAge!,
        annualIncome:           partial.annualIncome!,
        currentSavings:         partial.currentSavings!,
        monthlyExpenses:        parseFloat(getVal('monthlyExpenses')),
        monthlySavings:         ms,
        annualSalaryGrowthPct:  mode === 'detailed' ? (sliderValues['annualSalaryGrowthPct'] ?? 3) : undefined,
        annualBonusLumpSum:     mode === 'detailed' ? (parseFloat(getVal('annualBonusLumpSum') || '0')) : undefined,
        expectedReturnPct:      mode === 'detailed' ? (sliderValues['expectedReturnPct'] ?? 7) : undefined,
        monthlyDebtPayments:    mode === 'detailed' ? (parseFloat(getVal('monthlyDebtPayments') || '0')) : undefined,
        monthlyPensionIncome:   mode === 'detailed' ? (parseFloat(getVal('monthlyPensionIncome') || '0')) : undefined,
      })
      return
    }

    setError('')
    setStepIdx(i => i + 1)
  }

  const progress = ((stepIdx + 1) / STEPS.length) * 100

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

      {/* Otter background — changes every step */}
      <div className="absolute bottom-0 right-0 pointer-events-none select-none z-0 overflow-hidden" style={{ width: 260, height: 260 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={otterSrc}
          src={otterSrc}
          alt=""
          width={260}
          height={260}
          style={{
            imageRendering: 'pixelated',
            opacity: 0.13,
            display: 'block',
          }}
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
          {/* Icon + tag */}
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
          ) : (
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

          {/* Monthly savings sub-field (on expenses step) */}
          {isExpensesStep && (
            <div className="mt-5 pt-5 border-t-2 border-dashed border-[#D4B5A0]">
              <label className="block text-sm font-bold text-[#3D2008] mb-1">
                How much do you set aside each month right now?
              </label>
              <p className="text-xs text-[#9B8578] mb-3">
                401k, savings transfers, investments — anything you actively save. Enter 0 if none yet.
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

      {/* Dots */}
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
