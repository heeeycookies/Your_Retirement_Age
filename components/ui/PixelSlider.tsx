'use client'

interface Zone {
  from: number
  to: number
  label: string
  color: string
}

interface PixelSliderProps {
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  valueSuffix?: string
  zones?: Zone[]
  className?: string
}

export function PixelSlider({
  value,
  onChange,
  min,
  max,
  step = 0.5,
  valueSuffix = '',
  zones,
  className = '',
}: PixelSliderProps) {
  const pct = ((value - min) / (max - min)) * 100
  const totalRange = max - min

  return (
    <div className={`select-none ${className}`}>
      {/* Value badge */}
      <div className="flex justify-end mb-2">
        <span
          className="font-pixel text-xs px-3 py-1 bg-[#E879A0] text-white border-2 border-[#3D2008]"
          style={{ boxShadow: '2px 2px 0 #3D2008' }}
        >
          {value}{valueSuffix}
        </span>
      </div>

      {/* Track + thumb wrapper */}
      <div className="relative" style={{ height: 28 }}>
        {/* Track background */}
        <div
          className="absolute inset-y-0 left-0 right-0 my-auto border-4 border-[#3D2008]"
          style={{ height: 20, background: '#F0D9C4', boxShadow: 'inset 2px 2px 0 #D4B5A0' }}
        >
          {/* Filled portion */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#E879A0]"
            style={{ width: `${pct}%`, borderRight: pct > 0 && pct < 100 ? '3px solid #3D2008' : 'none' }}
          />
        </div>

        {/* Pixel thumb */}
        <div
          className="absolute top-0 bottom-0 my-auto bg-white border-4 border-[#3D2008] pointer-events-none"
          style={{
            width: 18,
            height: 28,
            left: `calc(${pct}% - 9px)`,
            boxShadow: '2px 2px 0 #3D2008',
          }}
        />

        {/* Native range input (invisible, handles interaction) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '100%' }}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between mt-1 text-xs text-[#9B8578]">
        <span>{min}{valueSuffix}</span>
        <span>{max}{valueSuffix}</span>
      </div>

      {/* Optional zone labels */}
      {zones && zones.length > 0 && (
        <div className="flex gap-1 mt-3">
          {zones.map(zone => {
            const width = ((zone.to - zone.from) / totalRange) * 100
            return (
              <div
                key={zone.label}
                className="flex flex-col items-center border-2 border-[#3D2008] px-1 py-1"
                style={{ width: `${width}%`, background: zone.color, boxShadow: '1px 1px 0 #3D2008' }}
              >
                <span className="text-[9px] font-bold text-[#3D2008] whitespace-nowrap leading-tight text-center">
                  {zone.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
