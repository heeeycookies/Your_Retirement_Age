'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Target, TrendingUp, DollarSign, Clock, Lightbulb, Home, BarChart2, CreditCard, Scissors, Mail, RotateCcw, CheckCircle, AlertCircle, Lock, ShoppingBag } from 'lucide-react'
import { WizardInputs, runCalculations } from '@/lib/calculations'
import { Currency, formatAmount, formatCompact } from '@/lib/currency'
import { GuiltyPleasures } from './GuiltyPleasures'
import { PortfolioChart } from './PortfolioChart'

interface ResultsPageProps {
  inputs: WizardInputs
  currency: Currency
  onReset: () => void
}

export function ResultsPage({ inputs, currency, onReset }: ResultsPageProps) {
  const results = runCalculations(inputs)
  const [progWidth, setProgWidth] = useState(0)
  const [emailSent, setEmailSent] = useState(false)
  const fa = (n: number) => formatAmount(n, currency)
  const fc = (n: number) => formatCompact(n, currency)

  useEffect(() => {
    const t = setTimeout(() => setProgWidth(results.currentProgress), 300)
    return () => clearTimeout(t)
  }, [])

  const { freedomNumber, currentProgress, requiredMonthlySavings, projectedRetireAge } = results
  const alreadyFree = inputs.currentSavings >= freedomNumber
  const onTrack     = projectedRetireAge !== null && projectedRetireAge <= inputs.retirementAge
  const gap         = requiredMonthlySavings - inputs.monthlySavings

  function getTip(): string {
    if (alreadyFree) return `Your savings already exceed your Freedom Number — you can retire right now. Talk to a financial advisor about a withdrawal strategy so your money lasts for decades.`
    if (onTrack)     return `You're already on track to retire by ${inputs.retirementAge}. Keep going — even an extra ${fa(100)}/month now could let you retire years earlier thanks to compound interest.`
    if (gap < 300)   return `You're very close. Adding just ${fa(gap)}/month gets you there on time. Try automating a transfer on payday — you won't miss what you don't see.`
    if (gap < 800)   return `To retire at ${inputs.retirementAge}, aim for ${fa(requiredMonthlySavings)}/month in savings. A great first step: open a tax-advantaged account (like a Roth IRA) and automate contributions — it grows completely tax-free.`
    return `Your biggest lever right now is increasing your income. A raise, promotion, or side income can close this gap faster than cutting expenses alone. Every extra dollar above your lifestyle goes straight to freedom.`
  }

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      const res = await fetch((e.currentTarget).action, {
        method: 'POST', body: new FormData(e.currentTarget), headers: { Accept: 'application/json' },
      })
      if (res.ok) setEmailSent(true)
    } catch { setEmailSent(true) }
  }

  const StatusIcon  = alreadyFree || onTrack ? CheckCircle : AlertCircle
  const statusColor = alreadyFree || onTrack ? '#4CAF50' : '#E879A0'
  const statusText  = alreadyFree
    ? 'You can already retire!'
    : onTrack
    ? `On track to retire by ${inputs.retirementAge}`
    : projectedRetireAge
    ? `At current pace: retire at ${projectedRetireAge} — ${projectedRetireAge - inputs.retirementAge} yrs past your goal`
    : 'Increase savings to reach your goal on time'

  const moderateReturn = inputs.expectedReturnPct ?? 7

  return (
    <div className="px-4 py-10" style={{ background: '#FFF8F0', minHeight: 'calc(100vh - 65px)' }}>
      <div className="max-w-2xl mx-auto space-y-5">

        {/* Header */}
        <div className="text-center mb-2">
          <p className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase mb-3">Your Results</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={alreadyFree || onTrack ? '/happy.png' : '/shocked.png'}
            alt="otter"
            width={80}
            height={80}
            style={{ imageRendering: 'pixelated', display: 'block', margin: '0 auto 12px' }}
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-[#3D2008] mb-2">Here's your number.</h1>
          <p className="text-[#9B8578] text-sm">Based on what you told us — plain and simple.</p>
        </div>

        {/* Freedom Number */}
        <div
          className="bg-[#3D2008] border-4 border-[#3D2008] p-8 text-center relative overflow-hidden"
          style={{ boxShadow: '6px 6px 0 #C68B57' }}
        >
          {/* Corner decorations */}
          {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map(pos => (
            <div key={pos} className={`absolute ${pos} w-4 h-4 border-2 border-[#C68B57] opacity-40`} />
          ))}
          <div className="flex items-center justify-center gap-2 mb-2">
            <Target className="w-4 h-4 text-[#F4A7B9]" />
            <span className="font-pixel text-[10px] text-[#F4A7B9] tracking-widest uppercase">Your Freedom Number</span>
          </div>
          <div className="text-5xl sm:text-6xl font-black text-white mb-3 tracking-tight">
            {fc(freedomNumber)}
          </div>
          <p className="text-[#D4B5A0] text-sm leading-relaxed max-w-sm mx-auto">
            This is how much you need in your account to retire and{' '}
            <strong className="text-white">never need to work again.</strong>{' '}
            Once you hit this, your investments pay for your life — forever.
          </p>
          <Link
            href="/how-it-works"
            className="inline-block mt-4 font-pixel text-[9px] text-[#C68B57] hover:text-[#F4A7B9] transition-colors tracking-widest"
          >
            How we calculate this →
          </Link>
        </div>

        {/* Plain English summary */}
        <div
          className="border-4 border-[#3D2008] p-6"
          style={{ background: '#FFF0E8', boxShadow: '4px 4px 0 #C68B57' }}
        >
          <p className="font-pixel text-[10px] text-[#E879A0] tracking-widest uppercase mb-4">In Plain English</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3 text-sm text-[#3D2008]">
              <div className="w-5 h-5 bg-[#F4A7B9] border-2 border-[#3D2008] flex-shrink-0 flex items-center justify-center mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#3D2008]" />
              </div>
              <span>
                You need <strong>{fc(freedomNumber)}</strong> total saved. Once you hit that, your investments earn enough interest to cover your life forever — you never need to work again.
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#3D2008]">
              <div className="w-5 h-5 bg-[#C8E6C9] border-2 border-[#3D2008] flex-shrink-0 flex items-center justify-center mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#3D2008]" />
              </div>
              <span>
                {alreadyFree
                  ? "You're already there! Your savings can cover your retirement right now."
                  : projectedRetireAge
                  ? <>At your current savings rate, you'll get there at <strong>age {projectedRetireAge}</strong> — that's <strong>{projectedRetireAge - inputs.currentAge} years from now</strong>.</>
                  : "At your current savings rate, you won't reach it before age 80. You need to save more each month."}
              </span>
            </li>
            <li className="flex items-start gap-3 text-sm text-[#3D2008]">
              <div className="w-5 h-5 bg-[#BBDEFB] border-2 border-[#3D2008] flex-shrink-0 flex items-center justify-center mt-0.5">
                <div className="w-1.5 h-1.5 bg-[#3D2008]" />
              </div>
              <span>
                {onTrack
                  ? <>You're on track! Keep saving <strong>{fa(inputs.monthlySavings)}/month</strong> and you'll hit your goal right on time.</>
                  : <>To retire by <strong>{inputs.retirementAge}</strong>, aim to save <strong>{fa(requiredMonthlySavings)}/month</strong> — that's about <strong>{fa(Math.round(requiredMonthlySavings / 30))}/day</strong>.</>}
              </span>
            </li>
            {results.debtImpactYears !== undefined && results.debtImpactYears > 0 && (
              <li className="flex items-start gap-3 text-sm text-[#3D2008]">
                <div className="w-5 h-5 bg-[#FFE0B2] border-2 border-[#3D2008] flex-shrink-0 flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#3D2008]" />
                </div>
                <span>
                  Once you pay off your debts and redirect that money to savings, you could retire <strong>{results.debtImpactYears} year{results.debtImpactYears !== 1 ? 's' : ''} earlier</strong>.
                </span>
              </li>
            )}
            {results.plannedExpenseAmount !== undefined && results.plannedExpenseAmount > 0 && (
              <li className="flex items-start gap-3 text-sm text-[#3D2008]">
                <div className="w-5 h-5 bg-[#E1BEE7] border-2 border-[#3D2008] flex-shrink-0 flex items-center justify-center mt-0.5">
                  <div className="w-1.5 h-1.5 bg-[#3D2008]" />
                </div>
                <span>
                  Your planned expense of <strong>{fa(results.plannedExpenseAmount)}</strong> in ~{results.plannedExpenseYear} year{results.plannedExpenseYear !== 1 ? 's' : ''} is factored into the projection — your portfolio dips at that point and then continues growing.
                </span>
              </li>
            )}
          </ul>
        </div>

        {/* Locked retirement account */}
        {results.lockedAccount && (
          <div className="border-4 border-[#3D2008] p-6 flex gap-4" style={{ background: '#EEF5FF', boxShadow: '4px 4px 0 #3D2008' }}>
            <div
              className="w-10 h-10 bg-[#BBDEFB] border-2 border-[#3D2008] flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '2px 2px 0 #3D2008' }}
            >
              <Lock className="w-5 h-5 text-[#3D2008]" strokeWidth={2} />
            </div>
            <div>
              <div className="font-pixel text-[10px] text-[#3D2008] tracking-widest uppercase mb-2">Locked Retirement Fund</div>
              <p className="text-sm text-[#3D2008] leading-relaxed">
                Your <strong>{fc(results.lockedAccount.balance)}</strong> locked fund (accessible at age {results.lockedAccount.accessAge}) isn't counted in the above — it's not accessible by your goal retirement age. But it'll be worth approximately{' '}
                <strong>{fc(results.lockedAccount.projectedValue)}</strong> when you can access it. Think of it as a bonus safety net.
              </p>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="bg-white border-4 border-[#3D2008] px-6 py-4 flex items-center gap-4" style={{ boxShadow: '4px 4px 0 #3D2008' }}>
          <StatusIcon className="w-6 h-6 flex-shrink-0" style={{ color: statusColor }} />
          <div>
            <div className="font-bold text-[#3D2008] text-sm">{statusText}</div>
            <div className="text-xs text-[#9B8578] mt-0.5">
              You have {fa(inputs.currentSavings)} saved · Goal is {fc(freedomNumber)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white border-4 border-[#3D2008] p-6" style={{ boxShadow: '4px 4px 0 #3D2008' }}>
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
            <span>{fa(0)}</span>
            <span>{fc(freedomNumber)}</span>
          </div>
        </div>

        {/* Three stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: DollarSign, label: 'Aim to earn at least', value: fa(results.requiredAnnualIncome), sub: 'per year before taxes',        color: '#BBDEFB' },
            { icon: TrendingUp, label: 'Save this per month', value: fa(requiredMonthlySavings), sub: `to retire on time · ${fa(Math.round(requiredMonthlySavings / 30))}/day`, color: '#C8E6C9' },
            { icon: Clock,      label: "Retire at age",        value: projectedRetireAge ? `${projectedRetireAge}` : '80+', sub: 'at your current pace', color: '#F4A7B9' },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="bg-white border-4 border-[#3D2008] p-5" style={{ boxShadow: '4px 4px 0 #3D2008' }}>
              <div className="w-9 h-9 border-2 border-[#3D2008] flex items-center justify-center mb-3" style={{ background: color, boxShadow: '2px 2px 0 #3D2008' }}>
                <Icon className="w-4 h-4 text-[#3D2008]" strokeWidth={2.5} />
              </div>
              <div className="text-[10px] font-bold text-[#9B8578] tracking-wide uppercase mb-1">{label}</div>
              <div className="text-2xl font-black text-[#3D2008] mb-1">{value}</div>
              <div className="text-xs text-[#9B8578]">{sub}</div>
            </div>
          ))}
        </div>

        {/* Planned major expense callout */}
        {results.plannedExpenseAmount !== undefined && results.plannedExpenseAmount > 0 && (
          <div className="border-4 border-[#3D2008] p-6 flex gap-4" style={{ background: '#F5EEFF', boxShadow: '4px 4px 0 #3D2008' }}>
            <div
              className="w-10 h-10 bg-[#E1BEE7] border-2 border-[#3D2008] flex items-center justify-center flex-shrink-0"
              style={{ boxShadow: '2px 2px 0 #3D2008' }}
            >
              <ShoppingBag className="w-5 h-5 text-[#3D2008]" strokeWidth={2} />
            </div>
            <div>
              <div className="font-pixel text-[10px] text-[#3D2008] tracking-widest uppercase mb-2">Planned Major Expense</div>
              <p className="text-sm text-[#3D2008] leading-relaxed">
                A <strong>{fa(results.plannedExpenseAmount)}</strong> expense in ~{results.plannedExpenseYear} year{results.plannedExpenseYear !== 1 ? 's' : ''} is built into your projection. You'll see a dip in the chart at that point — then growth resumes. If you cancel or delay this purchase, your retirement date improves.
              </p>
            </div>
          </div>
        )}

        {/* Scenario bars */}
        <div className="bg-white border-4 border-[#3D2008] p-6" style={{ boxShadow: '4px 4px 0 #3D2008' }}>
          <h3 className="font-bold text-[#3D2008] mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C68B57]" />
            When could you retire?
          </h3>
          <div className="space-y-3">
            {[
              { label: 'Safe & steady', scenario: results.scenarios.conservative, color: '#F0D9C4' },
              { label: 'Most likely',   scenario: results.scenarios.moderate,     color: '#F4A7B9' },
              { label: 'Markets boom',  scenario: results.scenarios.aggressive,   color: '#C8E6C9' },
            ].map(({ label, scenario, color }) => {
              const age = scenario.retireAtAge
              return (
                <div key={label} className="flex items-center gap-2 sm:gap-3">
                  <div className="w-20 sm:w-32 text-xs text-[#9B8578] shrink-0">{label}</div>
                  <div className="flex-1 h-5 bg-[#F0D9C4] border-2 border-[#3D2008] overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={{ width: `${Math.max(6, Math.min(96, ((age ?? 80) / 80) * 100))}%`, background: color, borderRight: '2px solid #3D2008' }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm font-bold text-[#3D2008] shrink-0">
                    {age && age <= 80 ? `Age ${age}` : '80+'}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-[#9B8578] mt-4">Based on your current savings of {fa(inputs.monthlySavings)}/month.</p>
          {inputs.annualBonusLumpSum && inputs.annualBonusLumpSum > 0 && (
            <p className="text-xs text-[#9B8578] mt-1">Includes your annual bonus of {fa(inputs.annualBonusLumpSum)}.</p>
          )}
        </div>

        {/* Interactive portfolio chart */}
        <PortfolioChart results={results} currency={currency} />

        {/* Tip */}
        <div className="border-4 border-[#3D2008] p-6 flex gap-4" style={{ background: '#FFF0E8', boxShadow: '4px 4px 0 #C68B57' }}>
          <div
            className="w-10 h-10 bg-[#F4A7B9] border-2 border-[#3D2008] flex items-center justify-center flex-shrink-0"
            style={{ boxShadow: '2px 2px 0 #3D2008' }}
          >
            <Lightbulb className="w-5 h-5 text-[#3D2008]" strokeWidth={2} />
          </div>
          <div>
            <div className="font-pixel text-[10px] text-[#E879A0] tracking-widest uppercase mb-2">Your Personalized Tip</div>
            <p className="text-sm text-[#5C3D2E] leading-relaxed">{getTip()}</p>
          </div>
        </div>

        {/* Otter moment */}
        <div className="bg-[#F0D9C4] border-4 border-[#3D2008] p-5 flex items-center gap-5" style={{ boxShadow: '4px 4px 0 #3D2008' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={alreadyFree || onTrack ? '/happy.png' : '/shocked.png'}
            alt={alreadyFree || onTrack ? 'happy otter' : 'shocked otter'}
            width={90}
            height={90}
            style={{ imageRendering: 'pixelated', flexShrink: 0 }}
          />
          <div>
            <div className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase mb-1">
              {alreadyFree ? 'You did it!' : onTrack ? 'Keep going!' : 'No worries!'}
            </div>
            <p className="text-sm font-semibold text-[#3D2008]">
              {alreadyFree
                ? "You're already financially free. Time to make a plan!"
                : onTrack
                ? "You're on track — the best time to stay consistent is now."
                : 'The best time to start was yesterday.\nThe second best time is right now.'}
            </p>
            <p className="text-xs text-[#9B8578] mt-1">Every dollar you save today is worth much more later thanks to compound growth.</p>
          </div>
        </div>

        {/* Guilty Pleasures */}
        <GuiltyPleasures
          freedomNumber={freedomNumber}
          currentAge={inputs.currentAge}
          retirementAge={inputs.retirementAge}
          currency={currency}
        />

        {/* Coming soon */}
        <div>
          <p className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase text-center mb-4">More Tools Coming Soon</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Home,       label: 'Mortgage Simulator',  desc: 'Can you afford that house?' },
              { icon: BarChart2,  label: 'Stock Calculator',    desc: 'How much will it grow?' },
              { icon: CreditCard, label: 'Debt Payoff Planner', desc: 'Destroy your debt faster' },
              { icon: Scissors,   label: 'Budget Builder',      desc: 'Find money you forgot about' },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="bg-white border-4 border-[#D4B5A0] p-4 opacity-55 cursor-not-allowed" style={{ boxShadow: '3px 3px 0 #D4B5A0' }}>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-[#F0D9C4] border-2 border-[#D4B5A0] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-[#9B8578]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#9B8578]">{label}</div>
                    <div className="text-xs text-[#BDBDBD]">{desc}</div>
                  </div>
                </div>
                <span className="font-pixel text-[8px] text-[#BDBDBD] tracking-widest mt-2 block">COMING SOON</span>
              </div>
            ))}
          </div>
        </div>

        {/* Email */}
        <div className="bg-white border-4 border-[#3D2008] p-8 text-center" style={{ boxShadow: '6px 6px 0 #C68B57' }}>
          <div className="w-12 h-12 bg-[#F4A7B9] border-2 border-[#3D2008] flex items-center justify-center mx-auto mb-4" style={{ boxShadow: '3px 3px 0 #3D2008' }}>
            <Mail className="w-6 h-6 text-[#3D2008]" strokeWidth={2} />
          </div>
          <h3 className="text-xl font-bold text-[#3D2008] mb-2">Get simple money tips in your inbox</h3>
          <p className="text-sm text-[#9B8578] mb-6 max-w-sm mx-auto">Plain English advice on saving, investing, and reaching your Freedom Number faster. No jargon.</p>
          {emailSent ? (
            <div className="flex items-center justify-center gap-2 text-[#4CAF50] font-bold">
              <CheckCircle className="w-5 h-5" /> You're in! Check your inbox soon.
            </div>
          ) : (
            <form
              onSubmit={handleEmail}
              action="https://formspree.io/f/YOUR_FORM_ID"
              method="POST"
              className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto"
            >
              <input
                type="email" name="email" required placeholder="your@email.com"
                className="flex-1 border-4 border-[#3D2008] bg-[#FAFAFA] text-[#3D2008] px-4 py-3 text-sm font-medium outline-none focus:bg-white"
                style={{ boxShadow: 'inset 2px 2px 0 #F0D9C4' }}
              />
              <button
                type="submit"
                className="px-5 py-3 border-4 border-[#3D2008] bg-[#E879A0] text-white font-pixel text-[10px] tracking-wide whitespace-nowrap"
                style={{ boxShadow: '3px 3px 0 #3D2008' }}
                onMouseDown={e => (e.currentTarget.style.boxShadow = '0 0 0 #3D2008')}
                onMouseUp={e   => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
              >
                Subscribe
              </button>
            </form>
          )}
        </div>

        {/* Recalculate */}
        <div className="text-center pb-8">
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-6 py-3 border-4 border-[#3D2008] bg-white text-[#3D2008] font-bold text-sm"
            style={{ boxShadow: '4px 4px 0 #3D2008' }}
            onMouseDown={e => (e.currentTarget.style.boxShadow = '0 0 0 #3D2008')}
            onMouseUp={e   => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = '4px 4px 0 #3D2008')}
          >
            <RotateCcw className="w-4 h-4" /> Start over with new numbers
          </button>
        </div>

      </div>
    </div>
  )
}
