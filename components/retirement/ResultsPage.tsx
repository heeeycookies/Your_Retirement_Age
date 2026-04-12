'use client'

import { useEffect, useRef, useState } from 'react'
import { Target, TrendingUp, DollarSign, Calendar, Lightbulb, Home, BarChart2, CreditCard, Scissors, Mail, RotateCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import { WizardInputs, CalculationResults, runCalculations, formatFull } from '@/lib/calculations'
import { PixelOtterStatic } from './PixelOtter'

interface ResultsPageProps {
  inputs: WizardInputs
  onReset: () => void
}

export function ResultsPage({ inputs, onReset }: ResultsPageProps) {
  const results = runCalculations(inputs)
  const emailFormRef = useRef<HTMLFormElement>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [progWidth, setProgWidth] = useState(0)

  // Animate progress bar on mount
  useEffect(() => {
    const t = setTimeout(() => setProgWidth(results.currentProgress), 200)
    return () => clearTimeout(t)
  }, [])

  const { freedomNumber, currentProgress, requiredMonthlySavings, projectedRetireAge } = results
  const alreadyFree = inputs.currentSavings >= freedomNumber
  const onTrack = projectedRetireAge !== null && projectedRetireAge <= inputs.retirementAge
  const gap = requiredMonthlySavings - inputs.monthlySavings

  // Tip logic
  function getTip(): string {
    if (alreadyFree) {
      return `Your savings already exceed your Freedom Number — you could retire right now. Talk to a financial advisor about setting up a withdrawal strategy so your money lasts decades.`
    }
    if (onTrack) {
      return `You're already on track to retire by ${inputs.retirementAge}. Keep it up — even adding an extra $100/month now could let you retire years earlier thanks to compound interest.`
    }
    if (gap < 300) {
      return `You're very close. Adding just ${formatFull(gap)}/month to your savings gets you there on time. Try automating a transfer on payday — you won't miss what you don't see.`
    }
    if (gap < 800) {
      return `To retire at ${inputs.retirementAge}, you need to save ${formatFull(requiredMonthlySavings)}/month. A great first step: open a Roth IRA ($7,000/year max) and automate contributions. It grows completely tax-free.`
    }
    return `Your biggest lever right now is increasing your income. A raise, promotion, or side income could close this gap faster than cutting expenses. Every extra dollar you earn above your lifestyle goes straight to freedom.`
  }

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    try {
      const res = await fetch((e.currentTarget as HTMLFormElement).action, {
        method: 'POST', body: data, headers: { Accept: 'application/json' },
      })
      if (res.ok) setEmailSent(true)
    } catch {
      setEmailSent(true) // graceful fallback
    }
  }

  const StatusIcon = alreadyFree ? CheckCircle : onTrack ? CheckCircle : AlertCircle
  const statusColor = alreadyFree || onTrack ? '#4CAF50' : '#E879A0'
  const statusText = alreadyFree
    ? 'You can already retire!'
    : onTrack
    ? `On track to retire at ${projectedRetireAge}`
    : projectedRetireAge
    ? `At current pace, retire at ${projectedRetireAge} (${projectedRetireAge - inputs.retirementAge} yrs late)`
    : 'Increase savings to reach your goal'

  return (
    <div className="min-h-screen bg-[#FFF8F0] px-4 py-12">
      <div className="max-w-2xl mx-auto space-y-5">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="text-center mb-2">
          <p className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase mb-3">Your Results</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3D2008] mb-2">Here's your number.</h1>
          <p className="text-[#9B8578] text-sm">Based on what you told us, here's exactly what you need to know.</p>
        </div>

        {/* ── The Freedom Number ──────────────────────────────── */}
        <div
          className="bg-[#3D2008] border-4 border-[#3D2008] p-8 text-center relative overflow-hidden"
          style={{ boxShadow: '6px 6px 0 #C68B57' }}
        >
          {/* Pixel corner decorations */}
          <div className="absolute top-3 left-3 w-4 h-4 border-2 border-[#C68B57] opacity-40" />
          <div className="absolute top-3 right-3 w-4 h-4 border-2 border-[#C68B57] opacity-40" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-2 border-[#C68B57] opacity-40" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-2 border-[#C68B57] opacity-40" />

          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#F4A7B9]" />
            <span className="font-pixel text-[10px] text-[#F4A7B9] tracking-widest uppercase">Your Freedom Number</span>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tight" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatFull(freedomNumber)}
          </div>
          <p className="text-[#D4B5A0] text-sm leading-relaxed max-w-sm mx-auto">
            This is how much you need in your account to retire and <strong className="text-white">never need to work again.</strong> Once you hit this number, your investments pay for your entire life — forever.
          </p>
        </div>

        {/* ── Status ──────────────────────────────────────────── */}
        <div
          className="bg-white border-4 border-[#3D2008] px-6 py-4 flex items-center gap-4"
          style={{ boxShadow: '4px 4px 0 #3D2008' }}
        >
          <StatusIcon className="w-6 h-6 flex-shrink-0" style={{ color: statusColor }} />
          <div>
            <div className="font-bold text-[#3D2008] text-sm">{statusText}</div>
            <div className="text-xs text-[#9B8578] mt-0.5">
              You have {formatFull(inputs.currentSavings)} saved · Goal is {formatFull(freedomNumber)}
            </div>
          </div>
        </div>

        {/* ── Progress bar ────────────────────────────────────── */}
        <div
          className="bg-white border-4 border-[#3D2008] p-6"
          style={{ boxShadow: '4px 4px 0 #3D2008' }}
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-bold text-[#3D2008]">Progress toward your Freedom Number</span>
            <span className="font-pixel text-xs text-[#E879A0]">{currentProgress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-5 bg-[#F0D9C4] border-4 border-[#3D2008]">
            <div
              className="h-full bg-[#E879A0] transition-all duration-1000 ease-out"
              style={{ width: `${progWidth}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#9B8578]">
            <span>$0</span>
            <span>{formatFull(freedomNumber)}</span>
          </div>
        </div>

        {/* ── Three stat cards ─────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: DollarSign,
              label: 'Aim to earn at least',
              value: formatFull(results.requiredAnnualIncome),
              sub: 'per year before taxes',
              color: '#BBDEFB',
            },
            {
              icon: TrendingUp,
              label: 'Save this per month',
              value: formatFull(requiredMonthlySavings),
              sub: 'to retire on time',
              color: '#C8E6C9',
            },
            {
              icon: Clock,
              label: "You'll retire at age",
              value: projectedRetireAge ? `${projectedRetireAge}` : 'After 80',
              sub: 'at your current savings pace',
              color: '#F4A7B9',
            },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div
              key={label}
              className="bg-white border-4 border-[#3D2008] p-5"
              style={{ boxShadow: '4px 4px 0 #3D2008' }}
            >
              <div className="w-9 h-9 border-2 border-[#3D2008] flex items-center justify-center mb-3"
                style={{ background: color, boxShadow: '2px 2px 0 #3D2008' }}>
                <Icon className="w-4 h-4 text-[#3D2008]" strokeWidth={2.5} />
              </div>
              <div className="text-xs font-bold text-[#9B8578] tracking-wide uppercase mb-1">{label}</div>
              <div className="text-2xl font-black text-[#3D2008] mb-1">{value}</div>
              <div className="text-xs text-[#9B8578]">{sub}</div>
            </div>
          ))}
        </div>

        {/* ── Scenario comparison ──────────────────────────────── */}
        <div
          className="bg-white border-4 border-[#3D2008] p-6"
          style={{ boxShadow: '4px 4px 0 #3D2008' }}
        >
          <h3 className="font-bold text-[#3D2008] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C68B57]" />
            Retirement age by investment return
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Conservative (5% / year)', scenario: results.scenarios.conservative, color: '#D4B5A0' },
              { label: 'Moderate (7% / year)',      scenario: results.scenarios.moderate,     color: '#F4A7B9' },
              { label: 'Aggressive (9% / year)',    scenario: results.scenarios.aggressive,   color: '#C8E6C9' },
            ].map(({ label, scenario, color }) => {
              const age = scenario.retireAtAge
              const pct = Math.min(100, age ? ((inputs.retirementAge - age) / inputs.retirementAge) * 100 + 50 : 10)
              return (
                <div key={label} className="flex items-center gap-3">
                  <div className="w-28 text-xs text-[#9B8578] shrink-0">{label}</div>
                  <div className="flex-1 h-5 bg-[#F0D9C4] border-2 border-[#3D2008] overflow-hidden">
                    <div className="h-full transition-all duration-700" style={{ width: `${Math.max(8, Math.min(95, (age ?? 0) / 80 * 100))}%`, background: color, borderRight: '2px solid #3D2008' }} />
                  </div>
                  <div className="w-20 text-right text-sm font-bold text-[#3D2008] shrink-0">
                    {age ? `Age ${age}` : '80+'}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-[#9B8578] mt-4">Based on your current savings rate of {formatFull(inputs.monthlySavings)}/month.</p>
        </div>

        {/* ── Tip ─────────────────────────────────────────────── */}
        <div
          className="border-4 border-[#3D2008] p-6 flex gap-4"
          style={{ background: '#FFF0E8', boxShadow: '4px 4px 0 #C68B57' }}
        >
          <div className="w-10 h-10 bg-[#F4A7B9] border-2 border-[#3D2008] flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '2px 2px 0 #3D2008' }}>
            <Lightbulb className="w-5 h-5 text-[#3D2008]" strokeWidth={2} />
          </div>
          <div>
            <div className="font-pixel text-[10px] text-[#E879A0] tracking-widest uppercase mb-2">Your Personalized Tip</div>
            <p className="text-sm text-[#5C3D2E] leading-relaxed">{getTip()}</p>
          </div>
        </div>

        {/* ── Otter moment ─────────────────────────────────────── */}
        <div
          className="bg-[#F0D9C4] border-4 border-[#3D2008] p-5 flex items-center gap-5"
          style={{ boxShadow: '4px 4px 0 #3D2008' }}
        >
          <PixelOtterStatic scale={1.4} />
          <div>
            <div className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase mb-1">Remember</div>
            <p className="text-sm font-semibold text-[#3D2008]">
              The best time to start was yesterday.<br />The second best time is right now.
            </p>
            <p className="text-xs text-[#9B8578] mt-1">Every dollar you save today is worth much more later thanks to compound growth.</p>
          </div>
        </div>

        {/* ── Coming soon ──────────────────────────────────────── */}
        <div>
          <p className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase text-center mb-4">More Tools Coming Soon</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Home,       label: 'Mortgage Simulator',   desc: 'Can you afford that house?' },
              { icon: BarChart2,  label: 'Stock Calculator',     desc: 'How much will it grow?' },
              { icon: CreditCard, label: 'Debt Payoff Planner',  desc: 'Destroy your debt faster' },
              { icon: Scissors,   label: 'Budget Builder',       desc: 'Find money you forgot about' },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="bg-white border-4 border-[#D4B5A0] p-4 opacity-60 cursor-not-allowed"
                style={{ boxShadow: '3px 3px 0 #D4B5A0' }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#F0D9C4] border-2 border-[#D4B5A0] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#9B8578]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#9B8578]">{label}</div>
                    <div className="text-xs text-[#BDBDBD]">{desc}</div>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-pixel text-[8px] text-[#BDBDBD] tracking-widest">COMING SOON</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Email capture ─────────────────────────────────────── */}
        <div
          className="bg-white border-4 border-[#3D2008] p-8 text-center"
          style={{ boxShadow: '6px 6px 0 #C68B57' }}
        >
          <div className="w-12 h-12 bg-[#F4A7B9] border-2 border-[#3D2008] flex items-center justify-center mx-auto mb-4"
            style={{ boxShadow: '3px 3px 0 #3D2008' }}>
            <Mail className="w-6 h-6 text-[#3D2008]" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-[#3D2008] mb-2">Get simple money tips in your inbox</h3>
          <p className="text-sm text-[#9B8578] mb-6 max-w-sm mx-auto">
            Plain English advice on saving, investing, and reaching your Freedom Number faster. No jargon, no spam.
          </p>

          {emailSent ? (
            <div className="flex items-center justify-center gap-2 text-[#4CAF50] font-bold">
              <CheckCircle className="w-5 h-5" />
              You're in! Check your inbox soon.
            </div>
          ) : (
            <form
              ref={emailFormRef}
              onSubmit={handleEmail}
              action="https://formspree.io/f/YOUR_FORM_ID"
              method="POST"
              className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
            >
              <input
                type="email"
                name="email"
                required
                placeholder="your@email.com"
                className="flex-1 border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] px-4 py-3 text-sm font-medium outline-none focus:bg-white"
                style={{ boxShadow: 'inset 2px 2px 0 #F0D9C4' }}
              />
              <button
                type="submit"
                className="px-5 py-3 border-4 border-[#3D2008] bg-[#E879A0] text-white font-pixel text-xs tracking-wide whitespace-nowrap"
                style={{ boxShadow: '3px 3px 0 #3D2008' }}
                onMouseDown={e => (e.currentTarget.style.boxShadow = '0px 0px 0 #3D2008')}
                onMouseUp={e => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* ── Recalculate ───────────────────────────────────────── */}
        <div className="text-center pb-8">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-3 border-4 border-[#3D2008] bg-white text-[#3D2008] font-bold text-sm"
            style={{ boxShadow: '4px 4px 0 #3D2008' }}
            onMouseDown={e => (e.currentTarget.style.boxShadow = '0px 0px 0 #3D2008')}
            onMouseUp={e => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
          >
            <RotateCcw className="w-4 h-4" />
            Start over with new numbers
          </button>
        </div>

      </div>
    </div>
  )
}
