'use client'

import dynamic from 'next/dynamic'
import { ChevronRight, PiggyBank, TrendingUp, Clock } from 'lucide-react'
import { PixelOtter } from './PixelOtter'

// Dynamically import Gravity to avoid SSR issues (Matter.js is browser-only)
const Gravity = dynamic(() => import('@/components/ui/gravity').then(m => m.Gravity), { ssr: false })
const MatterBody = dynamic(() => import('@/components/ui/gravity').then(m => m.MatterBody), { ssr: false })

interface IntroPageProps {
  onStart: () => void
}

const FLOATING_ITEMS = [
  { label: 'Financial Freedom', color: '#F4A7B9', x: '15%', y: '10%' },
  { label: 'Retire Early', color: '#C8E6C9', x: '65%', y: '8%' },
  { label: 'Save Smarter', color: '#BBDEFB', x: '35%', y: '15%' },
  { label: 'Own Your Time', color: '#FFE0B2', x: '78%', y: '18%' },
  { label: 'Build Wealth', color: '#E1BEE7', x: '52%', y: '5%' },
  { label: 'Dream Bigger', color: '#FFF9C4', x: '25%', y: '20%' },
]

export function IntroPage({ onStart }: IntroPageProps) {
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col overflow-hidden">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="w-full flex items-center justify-between px-8 py-5 border-b-4 border-[#3D2008] bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#F4A7B9] border-2 border-[#3D2008] flex items-center justify-center"
            style={{ boxShadow: '2px 2px 0 #3D2008' }}>
            <PiggyBank className="w-4 h-4 text-[#3D2008]" strokeWidth={2.5} />
          </div>
          <span className="font-pixel text-sm text-[#3D2008] tracking-wide">RetireCalc</span>
        </div>
        <span className="text-xs font-mono text-[#9B8578] tracking-widest uppercase">Your Freedom. Your Number.</span>
      </header>

      {/* ── Hero ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-4 text-center relative">

        {/* Pixel grid background */}
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #3D2008 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F4A7B9] border-2 border-[#3D2008] text-[#3D2008] text-xs font-bold tracking-widest uppercase mb-8"
          style={{ boxShadow: '3px 3px 0 #3D2008' }}
        >
          <span className="w-2 h-2 bg-[#3D2008] inline-block" />
          Free Calculator
          <span className="w-2 h-2 bg-[#3D2008] inline-block" />
        </div>

        {/* Title */}
        <h1 className="font-pixel text-2xl sm:text-3xl md:text-4xl text-[#3D2008] leading-relaxed mb-4 max-w-3xl">
          RETIREMENT
          <br />
          <span className="text-[#E879A0]">CALCULATOR</span>
        </h1>

        {/* Tagline */}
        <p className="text-xl sm:text-2xl text-[#5C3D2E] font-semibold mb-3 max-w-xl">
          Find out exactly how much money<br />you need to retire forever.
        </p>
        <p className="text-base text-[#9B8578] mb-10 max-w-lg">
          No confusing terms. No complicated math.<br />
          Just three numbers that will change how you think about money.
        </p>

        {/* Three things we'll tell you */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mb-12">
          {[
            { icon: PiggyBank, label: 'Your Freedom Number', desc: 'The exact amount you need saved to never work again' },
            { icon: TrendingUp, label: 'Monthly Save Goal', desc: 'How much to set aside every month to get there' },
            { icon: Clock,      label: 'Your Retire Date',   desc: 'The age you can actually stop working at your current pace' },
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

        {/* CTA */}
        <button
          onClick={onStart}
          className="group flex items-center gap-3 px-10 py-5 bg-[#E879A0] border-4 border-[#3D2008] text-white font-pixel text-base tracking-wide transition-all duration-75 hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px]"
          style={{ boxShadow: '6px 6px 0 #3D2008', transform: 'none' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '3px 3px 0 #3D2008')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '6px 6px 0 #3D2008')}
          onMouseDown={e => (e.currentTarget.style.boxShadow = '0px 0px 0 #3D2008')}
          onMouseUp={e => (e.currentTarget.style.boxShadow = '6px 6px 0 #3D2008')}
        >
          Calculate My Number
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-4 text-xs text-[#9B8578]">Takes about 2 minutes. 100% private — nothing is stored.</p>
      </main>

      {/* ── Gravity zone ─────────────────────────────────── */}
      <div className="relative w-full h-48 border-t-4 border-[#3D2008] bg-[#FDEEE0] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p className="font-pixel text-[10px] text-[#D4B5A0] tracking-widest uppercase">drag the blocks</p>
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

      {/* ── Walking otter ────────────────────────────────── */}
      <div className="w-full bg-[#F0D9C4] border-t-4 border-[#3D2008] overflow-hidden" style={{ height: '72px', position: 'relative' }}>
        <div className="absolute bottom-0 left-0" style={{ animation: 'pixelWalk 16s linear infinite' }}>
          <PixelOtter scale={1.4} walkDuration={99999} />
        </div>
        {/* Ground line decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#C68B57] border-t-4 border-[#3D2008]" />
      </div>
    </div>
  )
}
