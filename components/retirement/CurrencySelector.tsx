'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Currency, CURRENCY_LIST } from '@/lib/currency'

interface CurrencySelectorProps {
  value: Currency
  onChange: (c: Currency) => void
}

export function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = CURRENCY_LIST.find(c => c.code === value)!

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-3 py-2 border-2 border-[#3D2008] bg-white text-[#3D2008] font-bold text-xs transition-all"
        style={{ boxShadow: open ? '0 0 0 #3D2008' : '2px 2px 0 #3D2008' }}
      >
        <span className="font-pixel text-[10px]">{current.symbol}</span>
        <span>{current.code}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 bg-white border-4 border-[#3D2008] z-50 min-w-[160px]"
          style={{ boxShadow: '4px 4px 0 #3D2008' }}
        >
          {CURRENCY_LIST.map(c => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); setOpen(false) }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-semibold border-b border-[#F0D9C4] last:border-0 transition-colors hover:bg-[#FFF0E8] ${
                c.code === value ? 'bg-[#FFF0E8] text-[#E879A0]' : 'text-[#3D2008]'
              }`}
            >
              <span className="font-pixel text-[10px] w-6 text-center">{c.symbol}</span>
              <span className="text-xs font-bold">{c.code}</span>
              <span className="text-xs text-[#9B8578] font-normal">{c.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
