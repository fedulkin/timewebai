"use client"

import { useState, useRef, useLayoutEffect } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronDown, ArrowRight, Route, MessageSquare, TrendingUp, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

const modelExpenses = [
  { name: "GPT-4o",        amount: "1 820 ₽", pct: 43, color: "oklch(0.811 0.111 293.571)" },
  { name: "Claude 3.5",    amount: "1 100 ₽", pct: 26, color: "oklch(0.606 0.25 292.717)"  },
  { name: "Gemini 1.5",    amount:   "680 ₽", pct: 16, color: "oklch(0.75 0.14 180)"       },
  { name: "Mistral Large", amount:   "430 ₽", pct: 10, color: "oklch(0.78 0.14 350)"       },
  { name: "LLaMA 3",       amount:   "220 ₽", pct:  5, color: "oklch(0.78 0.12 60)"        },
]

const aiLog = [
  { time: "14:42", type: "gateway", status: 200, model: "gpt-4o", ms: 142 },
  { time: "14:43", type: "gateway", status: 200, model: "gpt-4p", ms: 145 },
  { time: "14:44", type: "gateway", status: 200, model: "gpt-4q", ms: 138 },
  { time: "14:45", type: "chat",    status: 500, model: "gpt-4r", ms: null },
  { time: "14:46", type: "chat",    status: 200, model: "gpt-4s", ms: 140 },
  { time: "14:47", type: "gateway", status: 200, model: "gpt-4t", ms: 155 },
]

// ─── Sparkline ────────────────────────────────────────────────────────────────

function Sparkline() {
  const points = [30, 45, 35, 55, 40, 60, 50, 70, 55, 65, 48, 72, 58, 68]
  const w = 200, h = 50
  const xs = points.map((_, i) => (i / (points.length - 1)) * w)
  const min = Math.min(...points), max = Math.max(...points)
  const ys = points.map((p) => h - ((p - min) / (max - min)) * h)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
      <polyline
        points={xs.map((x, i) => `${x},${ys[i]}`).join(" ")}
        fill="none"
        stroke="oklch(0.606 0.25 292.717)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Donut Chart ──────────────────────────────────────────────────────────────

function DonutChart() {
  const cx = 50, cy = 50, r = 36, sw = 10
  const circ = 2 * Math.PI * r
  const gap = 0.018
  let offset = 0
  return (
    <div className="relative shrink-0 w-[108px] h-[108px]">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth={sw} />
        {/* Segments */}
        {modelExpenses.map((m, i) => {
          const pct = m.pct / 100
          const dash = (pct - gap) * circ
          const sdo = -offset * circ
          offset += pct
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={m.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={sdo} strokeLinecap="round" />
          )
        })}
      </svg>
      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-[10px] text-muted-foreground leading-none">Итого</span>
        <span className="text-sm font-semibold font-mono leading-none">4 250 ₽</span>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FilterButton({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Button variant="outline" size="sm"
      className="gap-2 text-muted-foreground border-border/60 bg-muted/30 hover:bg-muted/60 h-9 px-3">
      {icon}{children}<ChevronDown className="size-3.5 opacity-60" />
    </Button>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path fillRule="evenodd" clipRule="evenodd" d="M17.7993 7.90984C18.1898 8.30036 18.1898 8.93353 17.7993 9.32405L11.533 15.5903C11.1425 15.9808 10.5093 15.9808 10.1188 15.5903L6.70085 12.1723C6.31033 11.7818 6.31033 11.1487 6.70085 10.7581C7.09138 10.3676 7.72454 10.3676 8.11507 10.7581L10.8259 13.469L16.3851 7.90984C16.7756 7.51931 17.4087 7.51931 17.7993 7.90984Z" fill={color}/>
    </svg>
  )
}

function FeatureCard({ icon: Icon, title, description, features, accent, href }: {
  icon: React.ElementType; title: string; description: string; features: string[]; accent?: string; href: string
}) {
  const color  = accent ?? "var(--primary)"
  const bgRgba = `color-mix(in srgb, ${color} 13%, transparent)`

  return (
    <Card className="bg-background dark:bg-transparent border-border/60 py-0">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl p-2.5 shrink-0" style={{ backgroundColor: bgRgba }}>
            <Icon className="size-5" style={{ color }} />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex flex-col gap-4 pl-14">
          <ul className="flex flex-col gap-1.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckIcon color={color} />{f}
              </li>
            ))}
          </ul>
          <Button variant="secondary" className="w-full gap-2" asChild>
            <Link href={href}>Перейти <ArrowRight className="size-4" /></Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ code }: { code: number }) {
  return (
    <span className={cn(
      "inline-flex items-center justify-center rounded px-1.5 py-0.5 text-xs font-mono font-medium min-w-[2.5rem]",
      code >= 500 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"
    )}>{code}</span>
  )
}

// ─── Spending chart ───────────────────────────────────────────────────────────

const rubData    = [320, 510, 420, 680, 590, 870, 760, 1020, 940, 1150, 980, 1340, 1180, 1460]
const tokenData  = [2.1, 3.4, 2.8, 4.5, 3.9, 5.8, 5.1,  6.8,  6.3,  7.7,  6.6,  8.9,  7.9,  9.7]
const chartDays  = ["14","15","16","17","18","19","20","21","22","23","24","25","26","27"]

function SpendingChart({ mode, fill }: { mode: "rub" | "tokens"; fill?: boolean }) {
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

  const data = mode === "rub" ? rubData : tokenData
  const pL = 48, pR = 12, pT = 10, pB = 24
  const cW = W - pL - pR, cH = H - pT - pB

  const minV = 0, maxV = Math.max(...data) * 1.2
  const xs = data.map((_, i) => pL + (i / (data.length - 1)) * cW)
  const ys = data.map(v => pT + cH - ((v - minV) / (maxV - minV)) * cH)

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => minV + (maxV - minV) * t)
  const polyPts = xs.map((x, i) => `${x},${ys[i]}`).join(" ")
  const areaPath = `M${xs[0]},${pT + cH} ` + xs.map((x, i) => `L${x},${ys[i]}`).join(" ") + ` L${xs.at(-1)},${pT + cH} Z`
  const stepW = cW / (data.length - 1)

  const fmt = (v: number) =>
    mode === "rub"
      ? v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v).toString()
      : v.toFixed(1)

  const hoveredLabel = hoverIdx !== null
    ? mode === "rub" ? `${data[hoverIdx].toLocaleString("ru")} ₽` : `${data[hoverIdx]} M`
    : null

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
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
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
                {fmt(v)}
              </text>
            </g>
          )
        })}

        {/* X labels */}
        {chartDays.map((label, i) => (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
            {label}
          </text>
        ))}

        {/* Area + line */}
        <path d={areaPath} fill="url(#spendGrad)" />
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
          <p className="text-[10px] text-muted-foreground mb-0.5">{chartDays[hoverIdx]}</p>
          <p className="text-xs font-mono font-semibold text-foreground">{hoveredLabel}</p>
        </div>
      )}
    </div>
  )
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow() {
  const [mode, setMode] = useState<"rub" | "tokens">("rub")

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Расход — 2/3 */}
      <Card className="md:col-span-2 bg-background dark:bg-transparent border-border/60 py-0 gap-0 flex flex-col">
        <div className="px-6 pt-6 pb-3 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Расход</p>
            <div className="flex items-center rounded-lg bg-muted/40 p-0.5 gap-0.5">
              {(["rub", "tokens"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "rub" ? "₽" : "Токены"}
                </button>
              ))}
            </div>
          </div>
          <p className="text-3xl font-semibold tracking-tight mb-3">
            {mode === "rub" ? "4 250.00 ₽" : "28.5 M"}
          </p>
        </div>
        <div className="flex-1 min-h-0 px-0 pb-4">
          <SpendingChart mode={mode} fill />
        </div>
      </Card>

      {/* Баланс — 1/3 */}
      <Card className="bg-background dark:bg-transparent border-border/60 py-0">
        <CardContent className="p-6 flex flex-col gap-5">
          {/* Основной баланс */}
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">Баланс</p>
            <p className="text-3xl font-semibold tracking-tight mb-3">2 450 ₽</p>
          </div>

          {/* Статы */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Потрачено в апреле</span>
              <span className="font-mono font-medium">4 250 ₽</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ср. расход / день</span>
              <span className="font-mono font-medium">155 ₽</span>
            </div>
            <div className="flex items-center justify-between text-sm pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Прогноз остатка</span>
              <span className="font-mono font-medium text-amber-600 dark:text-amber-400">~15 дней</span>
            </div>
          </div>

          <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            Пополнить баланс
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  return (
    <AppShell>
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 anim-delay-1">
          <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mb-0.5 shrink-0">
            <FilterButton icon={<CalendarDays className="size-3.5" />}>За текущий месяц</FilterButton>
            <FilterButton>По всем моделям</FilterButton>
            <FilterButton>По всем инструментам</FilterButton>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300 anim-delay-2">
          <StatsRow />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 anim-delay-3">
          <FeatureCard icon={Route} title="AI Gateway"
            description="Единый API для работы с 50+ моделями от ведущих провайдеров"
            features={["OpenAI, Antropic, Google, Mistral и другие", "Единый биллинг и лимиты", "Кэширование и балансировка"]}
            href="/ai-gateway" />
          <FeatureCard icon={MessageSquare} title="LLM-плейграунд"
            description="Общайтесь и тестируйте разные модели в одном месте"
            features={["OpenAI, Antropic, Google, Mistral и другие", "Сравнение ответов моделей", "История чатов и промптов"]}
            accent="#D36395"
            href="/chat" />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 anim-delay-4">
          <Card className="bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-6 flex flex-col gap-4">
              <p className="text-sm font-medium">Расходы по моделям</p>
              <div className="flex flex-col gap-3">
                {modelExpenses.map((m) => (
                  <div key={m.name} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="size-1.5 rounded-full shrink-0" style={{ background: m.color }} />
                        <span className="text-sm text-foreground truncate">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs text-muted-foreground">{m.amount}</span>
                        <span className="text-xs text-muted-foreground/50 w-7 text-right">{m.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${m.pct}%`, background: m.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium">AI-лог</p>
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-xs text-muted-foreground">Live</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {aiLog.map((entry, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm py-0.5">
                    <span className="font-mono text-xs text-muted-foreground w-10 shrink-0">{entry.time}</span>
                    {entry.type === "gateway"
                      ? <Route className="size-3.5 text-primary shrink-0" />
                      : <MessageSquare className="size-3.5 text-chart-2 shrink-0" />}
                    <StatusBadge code={entry.status} />
                    <span className="text-muted-foreground font-mono text-xs flex-1">{entry.model}</span>
                    <span className="text-xs text-muted-foreground font-mono shrink-0 w-12 text-right">
                      {entry.ms ? `${entry.ms} мс` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
    </AppShell>
  )
}
