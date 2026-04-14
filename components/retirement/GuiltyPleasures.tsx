'use client'

import { useState } from 'react'
import { Coffee, Leaf, Target, UtensilsCrossed, ShoppingBag, Wine, Gamepad2, Dumbbell, Plus, Sparkles } from 'lucide-react'
import { calcGuiltyPleasure, GuiltyPleasureFrequency } from '@/lib/calculations'
import { Currency, formatAmount, formatCompact, getSymbol } from '@/lib/currency'

interface Preset {
  name: string
  icon: React.ElementType
  defaultAmount: number
  frequency: GuiltyPleasureFrequency
  color: string
}

const PRESETS: Preset[] = [
  { name: 'Daily Coffee',     icon: Coffee,          defaultAmount: 6,   frequency: 'daily',   color: '#F4A7B9' },
  { name: 'Matcha / Tea',     icon: Leaf,            defaultAmount: 8,   frequency: 'daily',   color: '#C8E6C9' },
  { name: 'Sports / Fitness', icon: Dumbbell,        defaultAmount: 80,  frequency: 'monthly', color: '#DCEDC8' },
  { name: 'Golf',             icon: Target,          defaultAmount: 120, frequency: 'monthly', color: '#BBDEFB' },
  { name: 'Eating Out',       icon: UtensilsCrossed, defaultAmount: 25,  frequency: 'weekly',  color: '#FFE0B2' },
  { name: 'Shopping',         icon: ShoppingBag,     defaultAmount: 80,  frequency: 'monthly', color: '#E1BEE7' },
  { name: 'Drinks / Nights',  icon: Wine,            defaultAmount: 35,  frequency: 'weekly',  color: '#FFF9C4' },
  { name: 'Beauty / Spa',     icon: Sparkles,        defaultAmount: 60,  frequency: 'monthly', color: '#FCE4EC' },
  { name: 'Gaming / Subs',    icon: Gamepad2,        defaultAmount: 20,  frequency: 'monthly', color: '#B2EBF2' },
]

const FREQ_LABELS: Record<GuiltyPleasureFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

interface GuiltyPleasuresProps {
  freedomNumber: number
  currentAge: number
  retirementAge: number
  currency: Currency
}

export function GuiltyPleasures({ freedomNumber, currentAge, retirementAge, currency }: GuiltyPleasuresProps) {
  const yearsToRetirement = Math.max(1, retirementAge - currentAge)
  const sym = getSymbol(currency)

  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [customName, setCustomName] = useState('')
  const [amount, setAmount] = useState<string>('')
  const [frequency, setFrequency] = useState<GuiltyPleasureFrequency>('monthly')

  function selectPreset(p: Preset) {
    setActivePreset(p.name)
    setAmount(String(p.defaultAmount))
    setFrequency(p.frequency)
    setCustomName('')
  }

  function selectCustom() {
    setActivePreset('custom')
    setAmount('')
    setFrequency('monthly')
  }

  const parsedAmount = parseFloat(amount) || 0
  const result = parsedAmount > 0
    ? calcGuiltyPleasure(parsedAmount, frequency, yearsToRetirement, freedomNumber)
    : null

  const currentPreset = PRESETS.find(p => p.name === activePreset)

  return (
    <div
      className="bg-white border-4 border-[#3D2008] overflow-hidden"
      style={{ boxShadow: '6px 6px 0 #C68B57' }}
    >
      {/* Header */}
      <div className="bg-[#3D2008] px-6 py-4">
        <p className="font-pixel text-[10px] text-[#F4A7B9] tracking-widest uppercase mb-1">Guilty Pleasures Calculator</p>
        <p className="text-[#D4B5A0] text-sm">
          How much is your favourite splurge actually costing your retirement?
        </p>
      </div>

      <div className="p-6">
        {/* Preset grid */}
        <p className="text-xs font-bold text-[#9B8578] uppercase tracking-widest mb-3">Pick a guilty pleasure</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          {PRESETS.map(p => {
            const Icon = p.icon
            const isActive = activePreset === p.name
            return (
              <button
                key={p.name}
                onClick={() => selectPreset(p)}
                className="flex flex-col items-center gap-2 p-3 border-4 text-center transition-all"
                style={{
                  borderColor: isActive ? '#3D2008' : '#D4B5A0',
                  background: isActive ? p.color : '#FAFAFA',
                  boxShadow: isActive ? '3px 3px 0 #3D2008' : '2px 2px 0 #D4B5A0',
                }}
              >
                <div
                  className="w-9 h-9 flex items-center justify-center border-2 border-[#3D2008]"
                  style={{ background: p.color }}
                >
                  <Icon className="w-4 h-4 text-[#3D2008]" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold text-[#3D2008] leading-tight">{p.name}</span>
                <span className="text-[9px] text-[#9B8578]">
                  {formatAmount(p.defaultAmount, currency)}/{p.frequency === 'daily' ? 'day' : p.frequency === 'weekly' ? 'wk' : 'mo'}
                </span>
              </button>
            )
          })}

          {/* Custom */}
          <button
            onClick={selectCustom}
            className="flex flex-col items-center gap-2 p-3 border-4 text-center transition-all"
            style={{
              borderColor: activePreset === 'custom' ? '#3D2008' : '#D4B5A0',
              background: activePreset === 'custom' ? '#FFF0E8' : '#FAFAFA',
              boxShadow: activePreset === 'custom' ? '3px 3px 0 #3D2008' : '2px 2px 0 #D4B5A0',
            }}
          >
            <div className="w-9 h-9 flex items-center justify-center border-2 border-[#3D2008] bg-[#FFF0E8]">
              <Plus className="w-4 h-4 text-[#3D2008]" strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold text-[#3D2008] leading-tight">Others</span>
            <span className="text-[9px] text-[#9B8578]">custom</span>
          </button>
        </div>

        {/* Input row — shown when a preset or custom is selected */}
        {activePreset && (
          <div className="border-4 border-[#3D2008] p-5 mb-5" style={{ background: '#FFF8F0', boxShadow: 'inset 2px 2px 0 #F0D9C4' }}>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Name (custom only) */}
              {activePreset === 'custom' && (
                <div className="flex-1">
                  <label className="block text-xs font-bold text-[#3D2008] mb-1">What is it?</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    placeholder="e.g. Bubble tea"
                    className="w-full border-4 border-[#3D2008] bg-white text-[#3D2008] px-3 py-2 text-sm font-semibold outline-none"
                    style={{ boxShadow: 'inset 2px 2px 0 #F0D9C4' }}
                  />
                </div>
              )}

              {/* Amount */}
              <div className="flex-1">
                <label className="block text-xs font-bold text-[#3D2008] mb-1">
                  How much each time? <span className="text-[#E879A0] font-normal">(edit to match yours)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base font-bold text-[#9B8578] pointer-events-none">
                    {sym}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full border-4 border-[#3D2008] bg-white text-[#3D2008] pl-8 pr-3 py-2 text-xl font-black outline-none"
                    style={{ boxShadow: 'inset 2px 2px 0 #F0D9C4', appearance: 'none', MozAppearance: 'textfield' as never }}
                  />
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-bold text-[#3D2008] mb-1">How often?</label>
                <div className="flex border-4 border-[#3D2008]" style={{ boxShadow: '2px 2px 0 #3D2008' }}>
                  {(['daily', 'weekly', 'monthly'] as GuiltyPleasureFrequency[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className="px-3 py-2 text-xs font-bold border-r-2 border-[#3D2008] last:border-0 transition-colors"
                      style={{
                        background: frequency === f ? '#E879A0' : 'white',
                        color: frequency === f ? 'white' : '#3D2008',
                      }}
                    >
                      {FREQ_LABELS[f]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            className="border-4 border-[#3D2008] overflow-hidden"
            style={{ boxShadow: '4px 4px 0 #3D2008' }}
          >
            {/* Result header */}
            <div
              className="px-5 py-3 flex items-center gap-3"
              style={{ background: currentPreset?.color ?? '#FFF0E8' }}
            >
              {currentPreset && (() => { const I = currentPreset.icon; return <I className="w-4 h-4 text-[#3D2008]" strokeWidth={2} /> })()}
              <span className="font-bold text-sm text-[#3D2008]">
                {activePreset === 'custom' ? (customName || 'Your splurge') : activePreset}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 divide-x-4 divide-y-4 sm:divide-y-0 divide-[#3D2008]">
              {[
                { label: 'Per Month',    value: formatAmount(result.monthlyCost, currency) },
                { label: 'Per Year',     value: formatAmount(result.annualCost, currency) },
                { label: 'By Retirement',value: formatCompact(result.compoundedValue, currency) },
                { label: '% of Goal',   value: result.freedomNumberPct < 0.1 ? '<0.1%' : `${result.freedomNumberPct.toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="p-4 bg-white text-center">
                  <div className="text-[9px] font-bold text-[#9B8578] uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-lg font-black text-[#3D2008]">{value}</div>
                </div>
              ))}
            </div>

            {/* Friendly message */}
            <div
              className="px-5 py-4 border-t-4 border-[#3D2008] flex items-start gap-3"
              style={{ background: '#FFF8F0' }}
            >
              <div
                className="w-8 h-8 flex-shrink-0 border-2 border-[#3D2008] flex items-center justify-center"
                style={{ background: '#F4A7B9' }}
              >
                <span className="font-pixel text-[8px] text-[#3D2008]">!</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#3D2008] mb-1">{result.friendlyMessage}</p>
                <p className="text-xs text-[#9B8578]">
                  If you invested {formatAmount(result.monthlyCost, currency)}/month instead,
                  it would grow to <strong className="text-[#3D2008]">{formatCompact(result.compoundedValue, currency)}</strong> by
                  age {retirementAge} — that's <strong className="text-[#E879A0]">{result.freedomNumberPct.toFixed(1)}%</strong> of
                  your Freedom Number.
                </p>
              </div>
            </div>
          </div>
        )}

        {!activePreset && (
          <p className="text-center text-sm text-[#9B8578] py-4">
            Pick a category above to see the impact on your retirement.
          </p>
        )}
      </div>
    </div>
  )
}
