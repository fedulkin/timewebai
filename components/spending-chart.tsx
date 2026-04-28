"use client"

import { useState, useRef, useLayoutEffect } from "react"

interface SpendingChartProps {
  data: number[]
  days: string[]
  fill?: boolean
  formatTick: (v: number) => string
  formatLabel: (v: number) => string
  gradientId?: string
}

export function SpendingChart({
  data,
  days,
  fill,
  formatTick,
  formatLabel,
  gradientId = "spendGrad",
}: SpendingChartProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(600)
  const [H, setH] = useState(140)

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => {
      setW(e.contentRect.width)
      if (fill) setH(e.contentRect.height)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [fill])

  const pL = 48, pR = 12, pT = 10, pB = 24
  const cW = W - pL - pR, cH = H - pT - pB
  const minV = 0, maxV = Math.max(...data) * 1.2
  const xs = data.map((_, i) => pL + (i / (data.length - 1)) * cW)
  const ys = data.map(v => pT + cH - ((v - minV) / (maxV - minV)) * cH)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => minV + (maxV - minV) * t)
  const polyPts = xs.map((x, i) => `${x},${ys[i]}`).join(" ")
  const areaPath = `M${xs[0]},${pT + cH} ` + xs.map((x, i) => `L${x},${ys[i]}`).join(" ") + ` L${xs.at(-1)},${pT + cH} Z`
  const stepW = cW / (data.length - 1)

  return (
    <div ref={containerRef} className="relative w-full select-none pb-2" style={fill ? { height: "100%" } : { height: H + 24 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="w-full"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.606 0.25 292.717)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="oklch(0.606 0.25 292.717)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid + labels */}
        {yTicks.map((v, i) => {
          const y = pT + cH - ((v - minV) / (maxV - minV)) * cH
          return (
            <g key={i}>
              <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="white" strokeOpacity="0.05" strokeWidth="1" />
              <text x={pL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
                {formatTick(v)}
              </text>
            </g>
          )
        })}

        {/* X labels */}
        {days.map((label, i) => (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
            {label}
          </text>
        ))}

        {/* Area + line */}
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <polyline points={polyPts} fill="none" stroke="oklch(0.606 0.25 292.717)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Hover indicator */}
        {hoverIdx !== null && (
          <>
            <line x1={xs[hoverIdx]} y1={pT} x2={xs[hoverIdx]} y2={pT + cH} stroke="white" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx={xs[hoverIdx]} cy={ys[hoverIdx]} r="3.5" fill="oklch(0.606 0.25 292.717)" stroke="#121214" strokeWidth="2" />
          </>
        )}

        {/* Hit areas */}
        {data.map((_, i) => (
          <rect
            key={i}
            x={xs[i] - stepW / 2}
            y={pT}
            width={stepW}
            height={cH}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
          />
        ))}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (
        <div
          className="absolute pointer-events-none bg-popover border border-border/60 rounded-lg px-2.5 py-1.5 shadow-md whitespace-nowrap"
          style={{
            left: `${(xs[hoverIdx] / W) * 100}%`,
            top: `${(ys[hoverIdx] / H) * 100}%`,
            transform: `translate(${xs[hoverIdx] > W * 0.72 ? "calc(-100% - 8px)" : "8px"}, -50%)`,
          }}
        >
          <p className="text-[10px] text-muted-foreground mb-0.5">{days[hoverIdx]}</p>
          <p className="text-xs font-mono font-semibold text-foreground">{formatLabel(data[hoverIdx])}</p>
        </div>
      )}
    </div>
  )
}
