'use client'

import { useState } from 'react'
import { WizardInputs } from '@/lib/calculations'
import { IntroPage } from './IntroPage'
import { WizardForm } from './WizardForm'
import { ResultsPage } from './ResultsPage'

type Screen = 'intro' | 'wizard' | 'results'

export function RetirementApp() {
  const [screen, setScreen] = useState<Screen>('intro')
  const [inputs, setInputs] = useState<WizardInputs | null>(null)

  function handleStart() {
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
    <>
      {screen === 'intro' && <IntroPage onStart={handleStart} />}
      {screen === 'wizard' && <WizardForm onComplete={handleComplete} />}
      {screen === 'results' && inputs && <ResultsPage inputs={inputs} onReset={handleReset} />}
    </>
  )
}
