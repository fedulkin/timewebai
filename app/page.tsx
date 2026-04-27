"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronDown, ArrowRight, Route, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

const modelExpenses = [
  { name: "GPT-4o",        amount: "1 250.00 ₽", pct: 43, color: "bg-chart-1" },
  { name: "Claude 3.5",    amount: "1 250.00 ₽", pct: 43, color: "bg-chart-2" },
  { name: "Gemini 1.5",    amount: "1 250.00 ₽", pct: 43, color: "bg-chart-3" },
  { name: "Mistral Large", amount: "1 250.00 ₽", pct: 43, color: "bg-chart-4" },
  { name: "LLaMA 3",       amount: "1 250.00 ₽", pct: 43, color: "bg-chart-5" },
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
  const size = 100, cx = 50, cy = 50, r = 38, sw = 14
  const circ = 2 * Math.PI * r
  const segments = [
    { pct: 0.43, color: "oklch(0.606 0.25 292.717)" },
    { pct: 0.43, color: "oklch(0.811 0.111 293.571)" },
    { pct: 0.07, color: "oklch(0.85 0.1 180)" },
    { pct: 0.07, color: "oklch(0.8 0.15 350)" },
  ]
  let offset = 0
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-24 h-24 -rotate-90">
      {segments.map((seg, i) => {
        const dash = (seg.pct - 0.02) * circ
        const sdo = -offset * circ
        offset += seg.pct
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={seg.color}
            strokeWidth={sw} strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={sdo} strokeLinecap="round" />
        )
      })}
    </svg>
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

function FeatureCard({ icon: Icon, title, description, features }: {
  icon: React.ElementType; title: string; description: string; features: string[]
}) {
  return (
    <Card className="bg-transparent border-border/60 py-0">
      <CardContent className="p-6 flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/15 p-2.5 shrink-0">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        <ul className="flex flex-col gap-1.5">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="text-primary text-xs">✓</span>{f}
            </li>
          ))}
        </ul>
        <Button variant="secondary" className="w-full mt-auto gap-2">
          Перейти <ArrowRight className="size-4" />
        </Button>
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
const chartDays  = ["14 апр","15","16","17","18","19","20","21","22","23","24","25","26","27 апр"]

function SpendingChart({ mode }: { mode: "rub" | "tokens" }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const data = mode === "rub" ? rubData : tokenData
  const W = 560, H = 140
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

  const hovered = hoverIdx !== null ? data[hoverIdx] : null
  const hoveredLabel = hoverIdx !== null
    ? mode === "rub" ? `${data[hoverIdx].toLocaleString("ru")} ₽` : `${data[hoverIdx]} M`
    : null

  return (
    <div className="relative w-full select-none" style={{ height: H }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-full"
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
        {[0, 6, 13].map(i => (
          <text key={i} x={xs[i]} y={H - 4} textAnchor="middle" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
            {chartDays[i]}
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
    <div className="grid grid-cols-3 gap-4">
      {/* Расход — 2/3 */}
      <Card className="col-span-2 bg-transparent border-border/60 py-0">
        <CardContent className="pt-5 px-5 pb-0 flex flex-col gap-3">
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
          <p className="text-3xl font-semibold tracking-tight">
            {mode === "rub" ? "4 250.00 ₽" : "28.5 M"}
          </p>
          <div className="-mx-5">
            <SpendingChart mode={mode} />
          </div>
        </CardContent>
      </Card>

      {/* Баланс — 1/3 */}
      <Card className="bg-transparent border-border/60 py-0">
        <CardContent className="p-5 flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">Баланс</p>
          <p className="text-3xl font-semibold tracking-tight">2 450 ₽</p>
          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
            Пополнить
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
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <FilterButton icon={<CalendarDays className="size-3.5" />}>За текущий месяц</FilterButton>
            <FilterButton>По всем моделям</FilterButton>
            <FilterButton>По всем инструментам</FilterButton>
          </div>
        </div>

        {/* Stats */}
        <StatsRow />

        {/* Feature cards */}
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard icon={Route} title="AI Gateway"
            description="Единый API для работы с 50+ моделями от ведущих провайдеров"
            features={["OpenAI, Antropic, Google, Mistral и другие", "Единый биллинг и лимиты", "Кэширование и балансировка"]} />
          <FeatureCard icon={MessageSquare} title="Песочница"
            description="Общайтесь и тестируйте разные модели в одном месте"
            features={["OpenAI, Antropic, Google, Mistral и другие", "Сравнение ответов моделей", "История чатов и промптов"]} />
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-transparent border-border/60 py-0">
            <CardContent className="p-5">
              <p className="text-sm font-medium mb-4">Расходы по моделям</p>
              <div className="flex items-center gap-5">
                <DonutChart />
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                  {modelExpenses.map((m) => (
                    <div key={m.name} className="flex items-center justify-between gap-2 text-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={cn("size-2.5 rounded-full shrink-0", m.color)} />
                        <span className="text-muted-foreground truncate">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-muted-foreground">
                        <span className="font-mono text-xs">{m.amount}</span>
                        <span className="text-xs opacity-60">{m.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-transparent border-border/60 py-0">
            <CardContent className="p-5">
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
