'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronRight, PiggyBank, TrendingUp, Clock, Zap, BarChart3 } from 'lucide-react'
import { CalculationMode } from '@/lib/calculations'
import { Currency } from '@/lib/currency'

const Gravity    = dynamic(() => import('@/components/ui/gravity').then(m => m.Gravity),    { ssr: false })
const MatterBody = dynamic(() => import('@/components/ui/gravity').then(m => m.MatterBody), { ssr: false })

interface IntroPageProps {
  onStart: (mode: CalculationMode) => void
  currency: Currency
}

const FLOATING_ITEMS = [
  { label: 'Financial Freedom', color: '#F4A7B9', x: '12%', y: '10%' },
  { label: 'Retire Early',      color: '#C8E6C9', x: '62%', y: '8%'  },
  { label: 'Save Smarter',      color: '#BBDEFB', x: '33%', y: '15%' },
  { label: 'Own Your Time',     color: '#FFE0B2', x: '76%', y: '18%' },
  { label: 'Build Wealth',      color: '#E1BEE7', x: '50%', y: '5%'  },
  { label: 'Dream Bigger',      color: '#FFF9C4', x: '22%', y: '20%' },
]

// ── Isolated walking otter strip ──────────────────────────────
// Kept as a separate component so its state changes NEVER cause
// the parent (and the Gravity zone) to re-render.
const WALK_OTTERS = ['/happy.png', '/shocked.png', '/serious.png'] as const
const WALK_DURATION_MS = 15000

function WalkingOtterStrip() {
  const [walkIdx, setWalkIdx] = useState(0)
  const [walkKey, setWalkKey] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setWalkIdx(i => (i + 1) % 3)
      setWalkKey(k => k + 1)
    }, WALK_DURATION_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className="w-full border-t-4 border-[#3D2008] overflow-hidden relative"
      style={{ height: 80, background: '#1C1008' }}
    >
      <div
        key={walkKey}
        className="absolute bottom-2 left-0"
        style={{ animation: `pixelWalk ${WALK_DURATION_MS / 1000}s linear 1 forwards` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={WALK_OTTERS[walkIdx]}
          alt=""
          width={68}
          height={68}
          style={{ imageRendering: 'pixelated', mixBlendMode: 'screen', display: 'block' }}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-3 border-t-2 border-[#3D2008]" style={{ background: '#2A1810' }} />
    </div>
  )
}

// ── Main intro page ───────────────────────────────────────────
export function IntroPage({ onStart }: IntroPageProps) {
  const [showModes, setShowModes] = useState(false)

  return (
    <div className="flex flex-col overflow-hidden" style={{ background: '#FFF8F0' }}>

      {/* ── Hero ──────────────────────────────────────────── */}
      <main className="flex flex-col items-center justify-center px-6 pt-14 pb-6 text-center relative">
        {/* Pixel grid bg */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3D2008 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4A7B9] border-2 border-[#3D2008] text-[#3D2008] text-xs font-bold tracking-widest uppercase mb-8 relative z-10"
          style={{ boxShadow: '3px 3px 0 #3D2008' }}
        >
          <div className="w-2 h-2 bg-[#3D2008]" />
          Free · No Sign-up
          <div className="w-2 h-2 bg-[#3D2008]" />
        </div>

        <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-[#3D2008] leading-loose mb-4 max-w-3xl relative z-10">
          RETIREMENT
          <br />
          <span style={{ color: '#E879A0' }}>CALCULATOR</span>
        </h1>

        <p className="text-xl sm:text-2xl text-[#5C3D2E] font-semibold mb-3 max-w-xl relative z-10">
          Find out exactly how much money<br />you need to retire forever.
        </p>
        <p className="text-base text-[#9B8578] mb-10 max-w-lg relative z-10">
          No confusing terms. No complicated math.<br />
          Just three numbers that change how you think about money.
        </p>

        {/* Three feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-12 relative z-10">
          {[
            { icon: PiggyBank,  label: 'Your Freedom Number', desc: 'The exact amount you need saved to never work again' },
            { icon: TrendingUp, label: 'Monthly Save Goal',   desc: 'How much to set aside every month to get there' },
            { icon: Clock,      label: 'Your Retire Date',    desc: 'The age you can actually stop working at your current pace' },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="bg-white border-2 border-[#D4B5A0] p-5 text-left"
              style={{ boxShadow: '3px 3px 0 #C68B57' }}
            >
              <div className="w-9 h-9 bg-[#FFF0E8] border-2 border-[#D4B5A0] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-[#C68B57]" strokeWidth={2} />
              </div>
              <div className="font-bold text-[#3D2008] text-sm mb-1">{label}</div>
              <div className="text-xs text-[#9B8578] leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>

        {/* ── CTA / Mode selector ───────────────────────── */}
        <div className="w-full max-w-xl mb-6 relative z-10">
          {!showModes ? (
            /* Big pink button — first thing they see */
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => setShowModes(true)}
                className="w-full px-8 py-5 border-4 border-[#3D2008] bg-[#E879A0] text-white font-pixel text-sm tracking-wide uppercase"
                style={{ boxShadow: '6px 6px 0 #3D2008' }}
                onMouseDown={e  => (e.currentTarget.style.boxShadow = '0 0 0 #3D2008')}
                onMouseUp={e    => (e.currentTarget.style.boxShadow = '6px 6px 0 #3D2008')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '6px 6px 0 #3D2008')}
              >
                Calculate My Number
              </button>
              <p className="text-[11px] text-[#9B8578]">100% private — nothing is stored or shared.</p>
            </div>
          ) : (
            /* Mode cards — revealed after clicking the big button */
            <div>
              <p className="font-pixel text-[10px] text-[#9B8578] tracking-widest uppercase mb-4">
                Choose your mode
              </p>
              <div className="grid grid-cols-2 gap-4">

                {/* Quick */}
                <button
                  onClick={() => onStart('quick')}
                  className="group flex flex-col items-center gap-3 p-6 bg-white border-4 border-[#3D2008] text-left transition-all hover:bg-[#FFF0E8]"
                  style={{ boxShadow: '5px 5px 0 #3D2008' }}
                  onMouseDown={e  => (e.currentTarget.style.boxShadow = '0 0 0 #3D2008')}
                  onMouseUp={e    => (e.currentTarget.style.boxShadow = '5px 5px 0 #3D2008')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 0 #3D2008')}
                >
                  <div
                    className="w-12 h-12 border-4 border-[#3D2008] flex items-center justify-center"
                    style={{ background: '#F4A7B9', boxShadow: '3px 3px 0 #3D2008' }}
                  >
                    <Zap className="w-5 h-5 text-[#3D2008]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-pixel text-[10px] text-[#3D2008] mb-1">QUICK CALC</div>
                    <div className="text-xs font-semibold text-[#5C3D2E] mb-1">5 questions · 2 min</div>
                    <div className="text-[11px] text-[#9B8578]">Get your core numbers fast. Perfect for a first look.</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#E879A0] mt-1 group-hover:translate-x-1 transition-transform">
                    Start <ChevronRight className="w-3 h-3" />
                  </div>
                </button>

                {/* Detailed */}
                <button
                  onClick={() => onStart('detailed')}
                  className="group flex flex-col items-center gap-3 p-6 bg-white border-4 border-[#3D2008] text-left transition-all hover:bg-[#FFF0E8]"
                  style={{ boxShadow: '5px 5px 0 #3D2008' }}
                  onMouseDown={e  => (e.currentTarget.style.boxShadow = '0 0 0 #3D2008')}
                  onMouseUp={e    => (e.currentTarget.style.boxShadow = '5px 5px 0 #3D2008')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '5px 5px 0 #3D2008')}
                >
                  <div
                    className="w-12 h-12 border-4 border-[#3D2008] flex items-center justify-center"
                    style={{ background: '#C8E6C9', boxShadow: '3px 3px 0 #3D2008' }}
                  >
                    <BarChart3 className="w-5 h-5 text-[#3D2008]" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="font-pixel text-[10px] text-[#3D2008] mb-1">FULL PICTURE</div>
                    <div className="text-xs font-semibold text-[#5C3D2E] mb-1">11 questions · 5 min</div>
                    <div className="text-[11px] text-[#9B8578]">Salary growth, bonuses, debt, pension, retirement fund — the full story.</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#E879A0] mt-1 group-hover:translate-x-1 transition-transform">
                    Start <ChevronRight className="w-3 h-3" />
                  </div>
                </button>

              </div>
              <p className="text-[11px] text-[#9B8578] mt-3 text-center">100% private — nothing is stored or shared.</p>
            </div>
          )}
        </div>
      </main>

      {/* ── Gravity zone ──────────────────────────────────── */}
      <div className="relative w-full h-44 border-t-4 border-[#3D2008] overflow-hidden" style={{ background: '#FDEEE0' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-pixel text-[9px] text-[#D4B5A0] tracking-widest uppercase">drag the blocks around</p>
        </div>
        <Gravity gravity={{ x: 0, y: 1 }} className="w-full h-full" addTopWall={false}>
          {FLOATING_ITEMS.map((item, i) => (
            <MatterBody
              key={i}
              x={item.x}
              y={item.y}
              matterBodyOptions={{ friction: 0.5, restitution: 0.3, density: 0.002 }}
            >
              <div
                className="px-4 py-2 border-2 border-[#3D2008] font-bold text-sm text-[#3D2008] whitespace-nowrap cursor-grab"
                style={{ background: item.color, boxShadow: '2px 2px 0 #3D2008' }}
              >
                {item.label}
              </div>
            </MatterBody>
          ))}
        </Gravity>
      </div>

      {/* ── Walking otter strip ───────────────────────────── */}
      <WalkingOtterStrip />

      {/* ── Credits footer ────────────────────────────────── */}
      <footer className="w-full border-t-4 border-[#3D2008] px-6 py-5 text-center" style={{ background: '#2A1408' }}>
        <p className="font-pixel text-[9px] text-[#F4A7B9] tracking-widest mb-2">
          made with ♥ by heeeycookies
        </p>
        <p className="text-[10px] text-[#7A5C4A] leading-relaxed max-w-md mx-auto mb-3">
          This is a personal passion project — please don&apos;t copy or monetize without permission.
          Numbers are estimates only and not financial advice. Always consult a professional.
        </p>
        <Link href="/how-it-works" className="font-pixel text-[9px] text-[#C68B57] hover:text-[#F4A7B9] transition-colors tracking-widest">
          How the math works →
        </Link>
      </footer>

    </div>
  )
}
