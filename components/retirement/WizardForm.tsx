'use client'

import { useState } from 'react'
import { ChevronRight, ChevronLeft, DollarSign, PiggyBank, ShoppingBag, TrendingUp, Calendar } from 'lucide-react'
import { WizardInputs } from '@/lib/calculations'
import { PixelOtterStatic } from './PixelOtter'

interface WizardFormProps {
  onComplete: (inputs: WizardInputs) => void
}

interface StepConfig {
  id: keyof WizardInputs | 'retirementAge'
  icon: React.ElementType
  tag: string
  question: string
  hint: string
  prefix?: '$'
  suffix?: string
  placeholder: string
  min: number
  max?: number
  validate: (val: number, inputs: Partial<WizardInputs>) => string | null
}

const STEPS: StepConfig[] = [
  {
    id: 'currentAge',
    icon: Calendar,
    tag: 'Step 1 of 5',
    question: 'How old are you right now?',
    hint: 'Your current age helps us calculate how many years you have to grow your savings.',
    placeholder: '28',
    min: 16,
    max: 79,
    validate: (v) => {
      if (!v || v < 16 || v > 79) return 'Enter an age between 16 and 79.'
      return null
    },
  },
  {
    id: 'retirementAge',
    icon: Calendar,
    tag: 'Step 2 of 5',
    question: 'What age do you want to retire?',
    hint: 'This is your goal. There\'s no wrong answer — earlier just means saving a bit more each month.',
    placeholder: '50',
    min: 25,
    max: 90,
    validate: (v, inputs) => {
      if (!v || v < 25) return 'Retirement age must be at least 25.'
      if (inputs.currentAge && v <= inputs.currentAge) return `Must be older than your current age (${inputs.currentAge}).`
      return null
    },
  },
  {
    id: 'annualIncome',
    icon: DollarSign,
    tag: 'Step 3 of 5',
    question: 'How much do you make per year?',
    hint: 'Include salary, freelance, side hustles — everything before taxes. Enter 0 if you\'re in school or between jobs.',
    prefix: '$',
    placeholder: '55,000',
    min: 0,
    validate: (v) => {
      if (isNaN(v) || v < 0) return 'Enter your income (enter 0 if none right now).'
      return null
    },
  },
  {
    id: 'currentSavings',
    icon: PiggyBank,
    tag: 'Step 4 of 5',
    question: 'How much have you saved so far?',
    hint: 'Add up everything: savings account, 401k, Roth IRA, stocks. Starting at zero? That\'s perfectly fine.',
    prefix: '$',
    placeholder: '10,000',
    min: 0,
    validate: (v) => {
      if (isNaN(v) || v < 0) return 'Enter 0 or more.'
      return null
    },
  },
  {
    id: 'monthlyExpenses',
    icon: ShoppingBag,
    tag: 'Step 5 of 5',
    question: 'How much do you spend each month?',
    hint: 'Rent, food, subscriptions, going out — everything. Be honest with yourself. We\'ll also ask how much you currently save.',
    prefix: '$',
    placeholder: '2,500',
    min: 1,
    validate: (v) => {
      if (!v || v <= 0) return 'Enter your monthly spending.'
      return null
    },
  },
]

export function WizardForm({ onComplete }: WizardFormProps) {
  const [stepIdx, setStepIdx] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [savings, setSavings] = useState('')
  const [savingsErr, setSavingsErr] = useState('')
  const [error, setError] = useState('')

  const step = STEPS[stepIdx]
  const isLast = stepIdx === STEPS.length - 1

  function getRaw(id: string) {
    return values[id] ?? ''
  }

  function handleChange(val: string) {
    setValues(prev => ({ ...prev, [step.id]: val }))
    setError('')
  }

  function buildPartialInputs(): Partial<WizardInputs> {
    return {
      currentAge:    values['currentAge']    ? parseInt(values['currentAge'])    : undefined,
      retirementAge: values['retirementAge'] ? parseInt(values['retirementAge']) : undefined,
      annualIncome:  values['annualIncome']  ? parseFloat(values['annualIncome']) : undefined,
      currentSavings:values['currentSavings']? parseFloat(values['currentSavings']): undefined,
    }
  }

  function handleNext() {
    const raw = getRaw(step.id)
    const num = parseFloat(raw.replace(/,/g, ''))
    const err = step.validate(num, buildPartialInputs())
    if (err) { setError(err); return }

    // On the last step, also validate monthlySavings inline input
    if (isLast) {
      const ms = parseFloat(savings.replace(/,/g, ''))
      if (savings === '' || isNaN(ms) || ms < 0) {
        setSavingsErr('Enter how much you save per month (0 is fine).')
        return
      }
      setSavingsErr('')
      const partial = buildPartialInputs()
      onComplete({
        currentAge:    partial.currentAge!,
        retirementAge: partial.retirementAge!,
        annualIncome:  partial.annualIncome!,
        currentSavings:partial.currentSavings!,
        monthlyExpenses: num,
        monthlySavings: ms,
      })
      return
    }

    setError('')
    setStepIdx(i => i + 1)
  }

  function handleBack() {
    setError('')
    setStepIdx(i => i - 1)
  }

  const Icon = step.icon
  const progress = ((stepIdx + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Pixel grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #3D2008 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

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

          {/* Tag + icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 bg-[#FFF0E8] border-2 border-[#D4B5A0] flex items-center justify-center"
              style={{ boxShadow: '2px 2px 0 #C68B57' }}>
              <Icon className="w-4 h-4 text-[#C68B57]" strokeWidth={2} />
            </div>
            <span className="font-pixel text-[10px] text-[#9B8578] tracking-widest">{step.tag}</span>
          </div>

          {/* Question */}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#3D2008] mb-3 leading-snug">
            {step.question}
          </h2>
          <p className="text-[#9B8578] text-sm leading-relaxed mb-8">{step.hint}</p>

          {/* Input */}
          <div className="space-y-3">
            <div className="relative">
              {step.prefix && (
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#9B8578] pointer-events-none">$</span>
              )}
              <input
                type="number"
                value={getRaw(step.id)}
                onChange={e => handleChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder={step.placeholder}
                min={step.min}
                max={step.max}
                inputMode="numeric"
                className="w-full border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] text-2xl font-bold py-4 outline-none transition-all focus:bg-white"
                style={{
                  paddingLeft: step.prefix ? '2.5rem' : '1rem',
                  paddingRight: '1rem',
                  boxShadow: 'inset 3px 3px 0 #F0D9C4',
                  appearance: 'none',
                  MozAppearance: 'textfield',
                }}
              />
            </div>
            {error && (
              <p className="text-sm font-semibold text-red-500 border-l-4 border-red-400 pl-3">{error}</p>
            )}

            {/* On the last step: also ask monthly savings inline */}
            {isLast && (
              <div className="mt-4 pt-4 border-t-2 border-dashed border-[#D4B5A0]">
                <label className="block text-sm font-bold text-[#3D2008] mb-2">
                  How much do you set aside per month right now?
                </label>
                <p className="text-xs text-[#9B8578] mb-3">
                  Include 401k contributions, savings transfers, investments — anything you're actively saving. Enter 0 if none yet.
                </p>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-[#9B8578] pointer-events-none">$</span>
                  <input
                    type="number"
                    value={savings}
                    onChange={e => { setSavings(e.target.value); setSavingsErr('') }}
                    onKeyDown={e => e.key === 'Enter' && handleNext()}
                    placeholder="300"
                    min={0}
                    inputMode="numeric"
                    className="w-full border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] text-2xl font-bold py-4 pl-10 pr-4 outline-none transition-all focus:bg-white"
                    style={{ boxShadow: 'inset 3px 3px 0 #F0D9C4', appearance: 'none', MozAppearance: 'textfield' }}
                  />
                </div>
                {savingsErr && (
                  <p className="text-sm font-semibold text-red-500 border-l-4 border-red-400 pl-3 mt-2">{savingsErr}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center px-8 sm:px-10 pb-8 gap-4">
          <button
            onClick={handleBack}
            disabled={stepIdx === 0}
            className="flex items-center gap-2 px-5 py-3 border-4 border-[#3D2008] bg-white text-[#3D2008] font-bold text-sm transition-all disabled:opacity-30"
            style={{ boxShadow: '3px 3px 0 #3D2008' }}
            onMouseDown={e => { if (!e.currentTarget.disabled) e.currentTarget.style.boxShadow = '0px 0px 0 #3D2008' }}
            onMouseUp={e => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-7 py-3 border-4 border-[#3D2008] bg-[#E879A0] text-white font-pixel text-xs tracking-wide transition-all"
            style={{ boxShadow: '4px 4px 0 #3D2008' }}
            onMouseDown={e => (e.currentTarget.style.boxShadow = '0px 0px 0 #3D2008')}
            onMouseUp={e => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
          >
            {isLast ? 'Show My Number' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mt-8 z-10">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className="border-2 border-[#3D2008] transition-all"
            style={{
              width: 12, height: 12,
              background: i < stepIdx ? '#E879A0' : i === stepIdx ? '#F4A7B9' : '#F0D9C4',
            }}
          />
        ))}
      </div>

      {/* Otter decoration (bottom corner) */}
      <div className="fixed bottom-4 right-4 opacity-60 z-10">
        <PixelOtterStatic scale={1.2} />
      </div>
    </div>
  )
}
