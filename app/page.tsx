"use client"

import { useState, useRef, useLayoutEffect } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronDown, Plus, CheckCircle2, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

const agentExpenses = [
  { id: "1", name: "Ассистент по продажам", color: "#7c3aed", amount: "1 620 ₽", pct: 38 },
  { id: "3", name: "Аналитик данных",       color: "#10b981", amount: "1 100 ₽", pct: 26 },
  { id: "2", name: "Контент-менеджер",      color: "#0ea5e9", amount:   "850 ₽", pct: 20 },
  { id: "4", name: "DevOps-ассистент",      color: "#f97316", amount:   "430 ₽", pct: 10 },
  { id: "5", name: "Исследователь",         color: "#ec4899", amount:   "250 ₽", pct:  6 },
]

const agentStatus = [
  { id: "1", name: "Ассистент по продажам", color: "#7c3aed", status: "active",  requests: 48, avgMs: 1240 },
  { id: "3", name: "Аналитик данных",       color: "#10b981", status: "active",  requests: 31, avgMs: 980  },
  { id: "2", name: "Контент-менеджер",      color: "#0ea5e9", status: "idle",    requests: 19, avgMs: 2050 },
  { id: "4", name: "DevOps-ассистент",      color: "#f97316", status: "idle",    requests: 12, avgMs: 760  },
  { id: "5", name: "Исследователь",         color: "#ec4899", status: "error",   requests:  7, avgMs: 3200 },
]

const topTasks = [
  { label: "Составить КП / письмо",   count: 34, pct: 100 },
  { label: "Анализ данных и отчёты",  count: 27, pct: 79  },
  { label: "Публикация контента",     count: 19, pct: 56  },
  { label: "Поиск информации",        count: 14, pct: 41  },
  { label: "Создание задач и issues", count: 11, pct: 32  },
  { label: "Запросы к базе данных",   count:  9, pct: 26  },
]

const agentLog = [
  { time: "14:42", agentName: "Ассистент по продажам", color: "#7c3aed", preview: "Помоги составить КП для клиента",    ms: 1340 },
  { time: "14:38", agentName: "Аналитик данных",       color: "#10b981", preview: "Сделай выборку из таблицы orders",   ms: 980  },
  { time: "14:31", agentName: "Контент-менеджер",      color: "#0ea5e9", preview: "Напиши пост про новый релиз",        ms: 2100 },
  { time: "14:20", agentName: "DevOps-ассистент",      color: "#f97316", preview: "Создай issue по баг-репорту",        ms: 760  },
  { time: "14:15", agentName: "Исследователь",         color: "#ec4899", preview: "Найди последние новости про OpenAI", ms: 3200 },
  { time: "14:08", agentName: "Ассистент по продажам", color: "#7c3aed", preview: "Отправь follow-up письмо Ивану",     ms: 890  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function FilterButton({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Button variant="outline" size="sm"
      className="gap-2 text-muted-foreground border-border/60 bg-muted/30 hover:bg-muted/60 h-9 px-3">
      {icon}{children}<ChevronDown className="size-3.5 opacity-60" />
    </Button>
  )
}

function AgentAvatar({ name, size = "md" }: { name: string; color?: string; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center shrink-0 font-semibold bg-muted/60 text-muted-foreground",
        size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs"
      )}
    >
      {name.charAt(0).toUpperCase()}
    </div>
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="white" strokeOpacity="0.06" strokeWidth={sw} />
        {agentExpenses.map((a, i) => {
          const pct = a.pct / 100
          const dash = (pct - gap) * circ
          const sdo = -offset * circ
          offset += pct
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={a.color} strokeWidth={sw}
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={sdo} strokeLinecap="round" />
          )
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-[10px] text-muted-foreground leading-none">Итого</span>
        <span className="text-sm font-semibold font-mono leading-none">4 250 ₽</span>
      </div>
    </div>
  )
}

// ─── Spending chart ───────────────────────────────────────────────────────────

const chartDays = ["14","15","16","17","18","19","20","21","22","23","24","25","26","27"]

// Per-agent daily spend: [sales, analytics, content, devops, research]
const agentColors = ["#7c3aed", "#10b981", "#0ea5e9", "#f97316", "#ec4899"]
const agentNames  = ["Ассистент по продажам", "Аналитик данных", "Контент-менеджер", "DevOps-ассистент", "Исследователь"]
const stackedData = [
  [122, 83, 64, 32, 19],
  [194, 133, 102, 51, 30],
  [160, 109, 84, 42, 25],
  [258, 177, 136, 68, 41],
  [224, 153, 118, 59, 36],
  [331, 226, 174, 87, 52],
  [289, 198, 152, 76, 45],
  [388, 265, 204, 102, 61],
  [357, 244, 188, 94, 57],
  [437, 299, 230, 115, 69],
  [373, 255, 196, 98, 58],
  [509, 348, 268, 134, 81],
  [449, 307, 236, 118, 70],
  [555, 380, 292, 146, 87],
]

const rubData = stackedData.map(d => d.reduce((a, b) => a + b, 0))

// ─── Stacked bar chart ────────────────────────────────────────────────────────

function StackedBarChart({ fill }: { fill?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(600)
  const [H, setH] = useState(160)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

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
  const totals = stackedData.map(d => d.reduce((a, b) => a + b, 0))
  const maxV = Math.max(...totals) * 1.15
  const n = stackedData.length
  const barW = Math.max(4, (cW / n) * 0.55)
  const gap  = cW / n
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(maxV * t))

  return (
    <div ref={containerRef} className="relative w-full select-none" style={fill ? { height: "100%" } : { height: H + 8 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="w-full" onMouseLeave={() => setHoverIdx(null)}>

        {/* Y grid + labels */}
        {yTicks.map((v, i) => {
          const y = pT + cH - (v / maxV) * cH
          return (
            <g key={i}>
              <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
              <text x={pL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
                {v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {stackedData.map((segments, i) => {
          const x = pL + i * gap + gap / 2 - barW / 2
          let y = pT + cH
          const isHover = hoverIdx === i
          return (
            <g key={i}>
              {segments.map((val, si) => {
                const h = (val / maxV) * cH
                y -= h
                return (
                  <rect
                    key={si}
                    x={x}
                    y={y}
                    width={barW}
                    height={h}
                    fill={agentColors[si]}
                    opacity={isHover ? 1 : 0.85}
                    rx={si === segments.length - 1 ? 3 : 0}
                    ry={si === segments.length - 1 ? 3 : 0}
                  />
                )
              })}
              {/* X label */}
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
                {chartDays[i]}
              </text>
              {/* Hit area */}
              <rect
                x={x - gap * 0.2}
                y={pT}
                width={gap * 0.6 + barW}
                height={cH}
                fill="transparent"
                onMouseEnter={() => setHoverIdx(i)}
              />
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (() => {
        const x = pL + hoverIdx * gap + gap / 2
        const total = totals[hoverIdx]
        return (
          <div
            className="absolute pointer-events-none bg-popover border border-border/60 rounded-lg px-3 py-2 shadow-md whitespace-nowrap z-10"
            style={{
              left: `${(x / W) * 100}%`,
              top: "20%",
              transform: `translateX(${x > W * 0.65 ? "calc(-100% - 8px)" : "8px"})`,
            }}
          >
            <p className="text-[10px] text-muted-foreground mb-1.5">{chartDays[hoverIdx]} апреля</p>
            {stackedData[hoverIdx].map((v, si) => (
              <div key={si} className="flex items-center gap-2 text-xs mb-0.5">
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: agentColors[si] }} />
                <span className="text-muted-foreground flex-1">{agentNames[si].split(" ")[0]}</span>
                <span className="font-mono font-medium">{v} ₽</span>
              </div>
            ))}
            <div className="border-t border-border/40 mt-1.5 pt-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">Итого</span>
              <span className="font-mono font-semibold">{total} ₽</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Расход */}
      <Card className="md:col-span-2 bg-background dark:bg-transparent border-border/60 py-0 gap-0 flex flex-col">
        <div className="px-6 pt-6 pb-3 flex flex-col gap-3 shrink-0">
          <p className="text-sm text-muted-foreground">Расход</p>
          <p className="text-3xl font-semibold tracking-tight mb-3">4 250.00 ₽</p>
        </div>
        <div className="flex-1 min-h-0 px-0 pb-4">
          <StackedBarChart fill />
        </div>
      </Card>

      {/* Баланс */}
      <Card className="bg-background dark:bg-transparent border-border/60 py-0">
        <CardContent className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">Баланс</p>
            <p className="text-3xl font-semibold tracking-tight">2 450 ₽</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Потрачено в апреле</span>
              <span className="font-mono font-medium">4 250 ₽</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Ср. расход / день</span>
              <span className="font-mono font-medium">155 ₽</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Прогноз остатка</span>
              <span className="font-mono font-medium text-amber-600 dark:text-amber-400">~15 дней</span>
            </div>
          </div>
          <Button size="lg" className="w-full">Пополнить баланс</Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()

  return (
    <AppShell>
      {/* Header */}
      <div className="section-enter flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Сводка</h1>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mb-0.5 shrink-0">
          <FilterButton icon={<CalendarDays className="size-3.5" />}>За текущий месяц</FilterButton>
          <FilterButton>По всем агентам</FilterButton>
          <Button size="sm" className="gap-2 h-9 shrink-0" onClick={() => router.push("/agents/new")}>
            <Plus className="size-3.5" />
            Новый агент
          </Button>
        </div>
      </div>

      {/* Widgets */}
      <div className="section-enter anim-delay-1 flex flex-col gap-4">

      <StatsRow />

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Расходы по агентам */}
        <Card className="bg-background dark:bg-transparent border-border/60 py-0 h-[300px]">
          <CardContent className="p-6 flex flex-col gap-5 h-full">
            <p className="text-sm font-medium">Расходы по агентам</p>
            <div className="flex flex-col gap-5">
              {agentExpenses.map((a) => (
                <div key={a.id} className="flex items-center gap-2.5">
                  <AgentAvatar name={a.name} color={a.color} size="sm" />
                  <div className="flex flex-col gap-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-foreground truncate">{a.name}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-xs text-muted-foreground">{a.amount}</span>
                        <span className="text-xs text-muted-foreground/50 w-6 text-right">{a.pct}%</span>
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-white/6 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Активность агентов */}
        <Card className="bg-background dark:bg-transparent border-border/60 py-0 h-[300px] flex flex-col">
          <CardContent className="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between shrink-0">
              <p className="text-sm font-medium">Активность агентов</p>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1">
              {agentLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 shrink-0">
                  <span className="font-mono text-xs text-muted-foreground/50 w-10 shrink-0">{entry.time}</span>
                  <AgentAvatar name={entry.agentName} color={entry.color} size="sm" />
                  <span className="text-xs text-muted-foreground flex-1 truncate">{entry.preview}</span>
                  <span className="text-xs text-muted-foreground/40 font-mono shrink-0">
                    {entry.ms >= 1000 ? `${(entry.ms / 1000).toFixed(1)}с` : `${entry.ms}мс`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Third row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Статус агентов */}
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col gap-4">
            <p className="text-sm font-medium">Статус агентов</p>
            <div className="flex flex-col gap-2">
              {agentStatus.map((a) => (
                <div key={a.id} className="flex items-center gap-3 py-1">
                  <AgentAvatar name={a.name} color={a.color} size="sm" />
                  <span className="text-xs text-foreground flex-1 truncate">{a.name}</span>
                  <span className="font-mono text-xs text-muted-foreground/60 shrink-0">{a.requests} запр.</span>
                  <span className="font-mono text-xs text-muted-foreground/60 shrink-0 w-14 text-right">
                    {a.avgMs >= 1000 ? `${(a.avgMs / 1000).toFixed(1)}с` : `${a.avgMs}мс`}
                  </span>
                  <span className="shrink-0">
                    {a.status === "active" && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                    {a.status === "idle"   && <Clock        className="size-3.5 text-muted-foreground/40" />}
                    {a.status === "error"  && <XCircle      className="size-3.5 text-destructive/70" />}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Топ задач */}
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col gap-4">
            <p className="text-sm font-medium">Топ задач</p>
            <div className="flex flex-col gap-3">
              {topTasks.map((t, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-foreground truncate">{t.label}</span>
                    <span className="font-mono text-xs text-muted-foreground shrink-0">{t.count}</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted/60 overflow-hidden">
                    <div className="h-full rounded-full bg-primary/50" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
      </div>{/* end widgets */}
    </AppShell>
  )
}
