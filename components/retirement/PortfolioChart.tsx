'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { CalculationResults } from '@/lib/calculations'
import { Currency, formatCompact } from '@/lib/currency'

interface PortfolioChartProps {
  results: CalculationResults
  currency: Currency
}

interface ChartRow {
  age: number
  year: number
  conservative: number
  moderate: number
  aggressive: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, freedomNumber, currency }: any) {
  const fc = (n: number) => formatCompact(n, currency)
  if (!active || !payload?.length) return null

  const row = payload[0]?.payload as ChartRow | undefined
  if (!row) return null

  const LABELS: Record<string, string> = {
    conservative: 'Safe & steady',
    moderate:     'Most likely',
    aggressive:   'Markets boom',
  }
  const COLORS: Record<string, string> = {
    conservative: '#C68B57',
    moderate:     '#E879A0',
    aggressive:   '#4CAF50',
  }

  return (
    <div
      className="bg-white border-4 border-[#3D2008] p-4 min-w-[180px]"
      style={{ boxShadow: '4px 4px 0 #3D2008' }}
    >
      <p className="font-pixel text-[9px] text-[#9B8578] tracking-widest uppercase mb-3">
        Age {label} · {row.year}
      </p>
      {payload.map((entry: { name: string; value: number }) => (
        <div key={entry.name} className="flex justify-between gap-6 mb-1.5">
          <span className="text-xs font-semibold" style={{ color: COLORS[entry.name] ?? '#3D2008' }}>
            {LABELS[entry.name] ?? entry.name}
          </span>
          <span className="text-xs font-black text-[#3D2008]">{fc(entry.value)}</span>
        </div>
      ))}
      <div className="border-t-2 border-dashed border-[#D4B5A0] mt-2 pt-2 flex justify-between">
        <span className="text-[10px] text-[#9B8578]">Freedom target</span>
        <span className="text-[10px] font-bold text-[#E879A0]">{fc(freedomNumber)}</span>
      </div>
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomLegend({ payload }: any) {
  const LABELS: Record<string, string> = {
    conservative: 'Safe & steady',
    moderate:     'Most likely',
    aggressive:   'Markets boom',
  }
  return (
    <div className="flex flex-wrap justify-center gap-4 pt-2">
      {payload?.map((entry: { value: string; color: string }) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <div className="w-3 h-3 border border-[#3D2008]" style={{ background: entry.color }} />
          <span className="text-xs text-[#5C3D2E]">{LABELS[entry.value] ?? entry.value}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5">
        <div className="w-5 border-t-2 border-dashed border-[#E879A0]" />
        <span className="text-xs text-[#E879A0]">Freedom Number</span>
      </div>
    </div>
  )
}

export function PortfolioChart({ results, currency }: PortfolioChartProps) {
  const fc    = (n: number) => formatCompact(n, currency)
  const { freedomNumber, scenarios } = results

  // Merge all three scenario projections into one array keyed by age
  const moderate     = scenarios.moderate.portfolioProjection
  const conservative = scenarios.conservative.portfolioProjection
  const aggressive   = scenarios.aggressive.portfolioProjection

  const chartData: ChartRow[] = moderate.map((row, i) => ({
    age:          row.age,
    year:         row.year,
    conservative: conservative[i]?.portfolioValue ?? 0,
    moderate:     row.portfolioValue,
    aggressive:   aggressive[i]?.portfolioValue ?? 0,
  }))

  // Show every 5-year tick on x-axis
  const xTicks = chartData.filter((_, i) => i % 5 === 0).map(d => d.age)

  // Y-axis max: highest aggressive value, or 1.5× freedom number — whichever is greater
  const maxVal = Math.max(
    freedomNumber * 1.5,
    aggressive[aggressive.length - 1]?.portfolioValue ?? 0,
  )

  return (
    <div
      className="bg-white border-4 border-[#3D2008] p-6"
      style={{ boxShadow: '4px 4px 0 #3D2008' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-2">
        <div>
          <p className="font-pixel text-[10px] text-[#E879A0] tracking-widest uppercase mb-1">Interactive Chart</p>
          <h3 className="font-bold text-[#3D2008] text-lg">Portfolio Growth Projection</h3>
          <p className="text-xs text-[#9B8578] mt-1">Hover over the chart to see your portfolio value at each age.</p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 border-2 border-[#E879A0]"
          style={{ background: '#FFF0F6' }}
        >
          <div className="w-2 h-2 bg-[#E879A0]" />
          <span className="text-xs font-bold text-[#E879A0]">Target: {fc(freedomNumber)}</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradConservative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#C68B57" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#C68B57" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradModerate" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#E879A0" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#E879A0" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradAggressive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4CAF50" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="4 4" stroke="#F0D9C4" vertical={false} />

          <XAxis
            dataKey="age"
            ticks={xTicks}
            tick={{ fontSize: 10, fill: '#9B8578', fontFamily: 'inherit' }}
            tickLine={false}
            axisLine={{ stroke: '#D4B5A0', strokeWidth: 2 }}
            label={{ value: 'Age', position: 'insideBottomRight', offset: -4, fontSize: 10, fill: '#9B8578' }}
          />

          <YAxis
            tickFormatter={v => fc(v)}
            domain={[0, maxVal]}
            tick={{ fontSize: 9, fill: '#9B8578', fontFamily: 'inherit' }}
            tickLine={false}
            axisLine={false}
            width={64}
          />

          <Tooltip
            content={
              <CustomTooltip
                freedomNumber={freedomNumber}
                currency={currency}
              />
            }
            cursor={{ stroke: '#3D2008', strokeWidth: 1, strokeDasharray: '4 4' }}
          />

          <Legend content={<CustomLegend />} />

          {/* Freedom Number reference line */}
          <ReferenceLine
            y={freedomNumber}
            stroke="#E879A0"
            strokeDasharray="6 3"
            strokeWidth={2}
          />

          {/* Areas — conservative below moderate below aggressive */}
          <Area
            type="monotone"
            dataKey="conservative"
            name="conservative"
            stroke="#C68B57"
            strokeWidth={2}
            fill="url(#gradConservative)"
            dot={false}
            activeDot={{ r: 4, stroke: '#3D2008', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="moderate"
            name="moderate"
            stroke="#E879A0"
            strokeWidth={2.5}
            fill="url(#gradModerate)"
            dot={false}
            activeDot={{ r: 5, stroke: '#3D2008', strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="aggressive"
            name="aggressive"
            stroke="#4CAF50"
            strokeWidth={2}
            fill="url(#gradAggressive)"
            dot={false}
            activeDot={{ r: 4, stroke: '#3D2008', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      <p className="text-[10px] text-[#9B8578] text-center mt-3 border-t-2 border-[#F0D9C4] pt-3">
        Conservative and aggressive scenarios are ±2% from your chosen return rate. All three use your actual inputs.
      </p>
    </div>
  )
}
