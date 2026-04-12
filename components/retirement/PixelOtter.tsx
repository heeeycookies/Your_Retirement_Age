'use client'

import { useEffect, useState } from 'react'

const PX = 10 // px per pixel cell

// Palette
const D = '#3D2008'  // dark outline
const M = '#7B4A2B'  // medium brown fur
const L = '#C68B57'  // light tan fur
const C = '#F2D9B5'  // cream face/muzzle
const B = '#1A1A1A'  // sunglasses black
const G = '#444444'  // sunglasses glare
const _ = null       // transparent

type Col = string | null

// Body (10 cols × 11 rows) — front-facing, like the reference image
const BODY: Col[][] = [
  [_,_,_,D,D,D,D,_,_,_],   // 0  head top
  [_,_,D,L,L,L,L,D,_,_],   // 1
  [_,D,L,L,L,L,L,L,D,_],   // 2
  [D,L,L,L,L,L,L,L,L,D],   // 3  full head width
  [D,L,M,B,B,B,B,M,L,D],   // 4  sunglasses top
  [D,L,M,B,G,B,G,M,L,D],   // 5  sunglasses with glare
  [_,D,L,C,C,C,C,L,D,_],   // 6  muzzle
  [_,D,L,C,D,D,C,L,D,_],   // 7  nose/whiskers
  [_,_,D,L,L,L,L,D,_,_],   // 8  chin
  [_,_,D,M,M,M,M,D,_,_],   // 9  neck
  [_,D,M,M,M,M,M,M,D,_],   // 10 body upper
  [_,D,M,M,M,M,M,M,D,_],   // 11 body lower
]

// Two walking frames — legs alternate
const LEGS: Col[][][] = [
  // Frame 0: left leg forward
  [
    [_,_,D,M,_,_,D,M,_,_],
    [_,_,D,D,_,_,D,D,_,_],
  ],
  // Frame 1: right leg forward
  [
    [_,D,M,_,_,D,M,_,_,_],
    [_,D,D,_,_,D,D,_,_,_],
  ],
]

function OtterFrame({ frame }: { frame: number }) {
  const rows = [...BODY, ...LEGS[frame]]
  const W = 10 * PX
  const H = rows.length * PX

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      style={{ imageRendering: 'pixelated', display: 'block' }}
    >
      {rows.map((row, ri) =>
        row.map((color, ci) =>
          color ? (
            <rect
              key={`${ri}-${ci}`}
              x={ci * PX}
              y={ri * PX}
              width={PX}
              height={PX}
              fill={color}
            />
          ) : null
        )
      )}
    </svg>
  )
}

interface PixelOtterProps {
  /** Scale multiplier — default 1.5 */
  scale?: number
  /** Additional wrapper class */
  className?: string
  /** Walking animation duration in seconds */
  walkDuration?: number
}

export function PixelOtter({ scale = 1.5, className = '', walkDuration = 16 }: PixelOtterProps) {
  const [frame, setFrame] = useState(0)

  // Alternate walking frames every 300ms
  useEffect(() => {
    const id = setInterval(() => setFrame(f => 1 - f), 300)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      className={className}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom left',
        imageRendering: 'pixelated',
        // Walk across the screen, loop infinitely
        animation: `pixelWalk ${walkDuration}s linear infinite`,
      }}
    >
      <OtterFrame frame={frame} />
    </div>
  )
}

/** Stationary otter (no walk animation) — for use in cards/decorations */
export function PixelOtterStatic({ scale = 1 }: { scale?: number }) {
  return (
    <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', imageRendering: 'pixelated' }}>
      <OtterFrame frame={0} />
    </div>
  )
}
