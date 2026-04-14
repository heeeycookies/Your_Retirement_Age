'use client'

import { useEffect, useState } from 'react'
import { PiggyBank } from 'lucide-react'
import { WizardInputs, CalculationMode } from '@/lib/calculations'
import { Currency } from '@/lib/currency'
import { CurrencySelector } from './CurrencySelector'
import { IntroPage } from './IntroPage'
import { WizardForm } from './WizardForm'
import { ResultsPage } from './ResultsPage'

type Screen = 'intro' | 'wizard' | 'results'

export function RetirementApp() {
  const [screen, setScreen]   = useState<Screen>('intro')
  const [mode, setMode]       = useState<CalculationMode>('quick')
  const [inputs, setInputs]   = useState<WizardInputs | null>(null)
  const [currency, setCurrency] = useState<Currency>('USD')

  // Persist currency across sessions
  useEffect(() => {
    const saved = localStorage.getItem('retire_currency') as Currency | null
    if (saved) setCurrency(saved)
  }, [])

  function handleCurrencyChange(c: Currency) {
    setCurrency(c)
    localStorage.setItem('retire_currency', c)
  }

  function handleStart(selectedMode: CalculationMode) {
    setMode(selectedMode)
    setScreen('wizard')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleComplete(data: WizardInputs) {
    setInputs(data)
    setScreen('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleReset() {
    setInputs(null)
    setScreen('intro')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Persistent header ───────────────────────────── */}
      <header className="w-full flex items-center justify-between px-6 sm:px-8 py-4 bg-white border-b-4 border-[#3D2008] sticky top-0 z-50">
        <button
          onClick={handleReset}
          className="flex items-center gap-3 group"
        >
          <div
            className="w-8 h-8 bg-[#F4A7B9] border-2 border-[#3D2008] flex items-center justify-center transition-transform group-hover:translate-y-[-1px]"
            style={{ boxShadow: '2px 2px 0 #3D2008' }}
          >
            <PiggyBank className="w-4 h-4 text-[#3D2008]" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-pixel text-[10px] text-[#3D2008] leading-tight tracking-wide">RetireCalc</div>
            <div className="text-[9px] text-[#9B8578] font-medium">Your Freedom Number</div>
          </div>
        </button>

        <div className="flex items-center gap-3">
          {screen !== 'intro' && (
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1 border-2 border-[#D4B5A0] text-xs text-[#9B8578]"
            >
              <span className="font-pixel text-[9px] uppercase tracking-widest">
                {mode === 'detailed' ? 'Full Picture' : 'Quick Calc'}
              </span>
            </div>
          )}
          <CurrencySelector value={currency} onChange={handleCurrencyChange} />
        </div>
      </header>

      {/* ── Screens ─────────────────────────────────────── */}
      <div className="flex-1">
        {screen === 'intro' && (
          <IntroPage onStart={handleStart} currency={currency} />
        )}
        {screen === 'wizard' && (
          <WizardForm mode={mode} currency={currency} onComplete={handleComplete} />
        )}
        {screen === 'results' && inputs && (
          <ResultsPage inputs={inputs} currency={currency} onReset={handleReset} />
        )}
      </div>
    </div>
  )
}
