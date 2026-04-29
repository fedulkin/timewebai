"use client"

import { useRef, useLayoutEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Plus, LayoutGrid, CalendarDays, ChevronDown,
  CheckCircle2, Clock, XCircle, ExternalLink,
  TrendingUp, Bot, Server, Wallet,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAgents } from "@/components/agents-provider"
import { useSolutions } from "@/components/solutions-provider"
import { SOLUTIONS } from "@/app/catalog/solutions-data"

// ─── Mock data ────────────────────────────────────────────────────────────────

// Per-day spend: [agents, servers]
const chartDays = ["14","15","16","17","18","19","20","21","22","23","24","25","26","27"]
const spendData: [number, number][] = [
  [320, 230], [507, 230], [415, 230], [663, 230],
  [581, 230], [848, 230], [736, 230], [1020, 230],
  [917, 460], [1131, 460], [959, 460], [1340, 460],
  [1180, 460], [1460, 460],
]

const agentLog = [
  { type: "agent",    time: "14:42", name: "Ассистент по продажам", color: "#7c3aed", text: "Составить КП для клиента",       ms: 1340 },
  { type: "solution", time: "14:38", name: "n8n",                   color: "#f97316", text: "Workflow запущен: onboarding",   ms: null },
  { type: "agent",    time: "14:31", name: "Контент-менеджер",      color: "#0ea5e9", text: "Написать пост про новый релиз",  ms: 2100 },
  { type: "agent",    time: "14:20", name: "DevOps-ассистент",      color: "#f97316", text: "Создать issue по баг-репорту",   ms: 760  },
  { type: "solution", time: "14:15", name: "OpenClaw",              color: "#7c3aed", text: "Новое подключение пользователя", ms: null },
  { type: "agent",    time: "14:08", name: "Ассистент по продажам", color: "#7c3aed", text: "Отправить follow-up письмо",     ms: 890  },
  { type: "solution", time: "13:55", name: "Dify",                  color: "#10b981", text: "Pipeline завершён за 4.2с",      ms: null },
  { type: "agent",    time: "13:40", name: "Аналитик данных",       color: "#10b981", text: "Выборка из таблицы orders",      ms: 980  },
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

// ─── KPI cards ────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, iconColor, trend, trendUp,
}: {
  label: string
  value: string
  sub?: string
  icon: React.ElementType
  iconColor: string
  trend?: string
  trendUp?: boolean
}) {
  return (
    <Card className="bg-background dark:bg-transparent border-border/60 py-0">
      <CardContent className="p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{label}</p>
          <div className="size-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${iconColor}18` }}>
            <Icon className="size-3.5" style={{ color: iconColor }} />
          </div>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-xs", trendUp ? "text-emerald-500" : "text-muted-foreground/60")}>
            {trendUp
              ? <ArrowUpRight className="size-3" />
              : <ArrowDownRight className="size-3" />
            }
            {trend}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Spending chart ───────────────────────────────────────────────────────────

const AGENT_COLOR  = "#7c3aed"
const SERVER_COLOR = "#0ea5e9"

function SpendChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [W, setW] = useState(600)
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const H = 168

  useLayoutEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  const pL = 44, pR = 12, pT = 10, pB = 24
  const cW = W - pL - pR, cH = H - pT - pB
  const totals = spendData.map(([a, s]) => a + s)
  const maxV = Math.max(...totals) * 1.2
  const n = spendData.length
  const barW = Math.max(4, (cW / n) * 0.55)
  const gap  = cW / n
  const yTicks = [0, 0.5, 1].map(t => Math.round(maxV * t))

  return (
    <div ref={containerRef} className="relative w-full select-none" style={{ height: H + 4 }}>
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="w-full" onMouseLeave={() => setHoverIdx(null)}>

        {/* Y grid */}
        {yTicks.map((v, i) => {
          const y = pT + cH - (v / maxV) * cH
          return (
            <g key={i}>
              <line x1={pL} y1={y} x2={W - pR} y2={y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
              <text x={pL - 6} y={y + 4} textAnchor="end" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
                {v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}
              </text>
            </g>
          )
        })}

        {/* Bars */}
        {spendData.map(([agents, servers], i) => {
          const x = pL + i * gap + gap / 2 - barW / 2
          const isHover = hoverIdx === i
          const totalH = ((agents + servers) / maxV) * cH
          const agentsH = (agents / maxV) * cH
          const serversH = (servers / maxV) * cH

          return (
            <g key={i}>
              {/* Servers (bottom) */}
              <rect
                x={x} y={pT + cH - totalH}
                width={barW} height={serversH}
                fill={SERVER_COLOR} opacity={isHover ? 1 : 0.8}
              />
              {/* Agents (top) */}
              <rect
                x={x} y={pT + cH - totalH + serversH}
                width={barW} height={agentsH}
                fill={AGENT_COLOR} opacity={isHover ? 1 : 0.85}
                rx={3} ry={3}
              />
              {/* X label */}
              <text x={x + barW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="oklch(0.556 0 0)" fontFamily="ui-monospace,monospace">
                {chartDays[i]}
              </text>
              {/* Hit area */}
              <rect x={x - gap * 0.2} y={pT} width={gap * 0.6 + barW} height={cH}
                fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
            </g>
          )
        })}
      </svg>

      {/* Tooltip */}
      {hoverIdx !== null && (() => {
        const x = pL + hoverIdx * gap + gap / 2
        const [agents, servers] = spendData[hoverIdx]
        return (
          <div
            className="absolute pointer-events-none bg-popover border border-border/60 rounded-lg px-3 py-2 shadow-md whitespace-nowrap z-10"
            style={{
              left: `${(x / W) * 100}%`,
              top: "10%",
              transform: `translateX(${x > W * 0.65 ? "calc(-100% - 8px)" : "8px"})`,
            }}
          >
            <p className="text-[10px] text-muted-foreground mb-1.5">{chartDays[hoverIdx]} апреля</p>
            <div className="flex items-center gap-2 text-xs mb-0.5">
              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: AGENT_COLOR }} />
              <span className="text-muted-foreground flex-1">Агенты</span>
              <span className="font-mono font-medium">{agents} ₽</span>
            </div>
            <div className="flex items-center gap-2 text-xs mb-0.5">
              <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: SERVER_COLOR }} />
              <span className="text-muted-foreground flex-1">Серверы</span>
              <span className="font-mono font-medium">{servers} ₽</span>
            </div>
            <div className="border-t border-border/40 mt-1.5 pt-1.5 flex justify-between text-xs">
              <span className="text-muted-foreground">Итого</span>
              <span className="font-mono font-semibold">{agents + servers} ₽</span>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ─── Solutions section ────────────────────────────────────────────────────────

const TIER_PRICES: Record<string, string> = {
  "Базовый":  "1 990 ₽/мес",
  "Стандарт": "3 490 ₽/мес",
  "Pro":      "6 990 ₽/мес",
}

function SolutionsCard() {
  const router = useRouter()
  const { solutions } = useSolutions()

  if (solutions.length === 0) {
    return (
      <Card className="bg-background dark:bg-transparent border-border/60 py-0 flex flex-col">
        <CardContent className="p-6 flex flex-col gap-4 flex-1">
          <p className="text-sm font-medium">Мои решения</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
            <div className="size-10 rounded-xl bg-muted/40 flex items-center justify-center">
              <Server className="size-5 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground text-center">Нет развёрнутых решений</p>
            <Button size="sm" variant="outline" className="gap-1.5 border-border/60"
              onClick={() => router.push("/catalog")}>
              <LayoutGrid className="size-3.5" />
              Каталог решений
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background dark:bg-transparent border-border/60 py-0 flex flex-col">
      <CardContent className="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm font-medium">Мои решения</p>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground gap-1"
            onClick={() => router.push("/catalog")}>
            <Plus className="size-3" />
            Развернуть
          </Button>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto">
          {solutions.map(sol => {
            const catalog = SOLUTIONS.find(s => s.slug === sol.slug)
            const Icon = catalog?.icon
            return (
              <button
                key={sol.id}
                onClick={() => router.push(`/solutions/${sol.id}`)}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors text-left group -mx-2"
              >
                {/* Icon */}
                {Icon
                  ? <div className="size-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${sol.color}20` }}>
                      <Icon className="size-3.5" style={{ color: sol.color }} />
                    </div>
                  : <div className="size-7 rounded-lg bg-muted/40 flex items-center justify-center shrink-0">
                      <Server className="size-3.5 text-muted-foreground/40" />
                    </div>
                }
                {/* Name + tier */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{sol.name}</p>
                  <p className="text-[10px] text-muted-foreground/60">{sol.tier} · {TIER_PRICES[sol.tier] ?? "—"}</p>
                </div>
                {/* Status dot */}
                <div className="flex items-center gap-2 shrink-0">
                  {sol.status === "running"   && <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />}
                  {sol.status === "deploying" && <span className="size-2 rounded-full bg-amber-400 animate-pulse" />}
                  {sol.status === "stopped"   && <span className="size-2 rounded-full bg-muted-foreground/30" />}
                  <ExternalLink className="size-3 text-muted-foreground/30 group-hover:text-muted-foreground/60 transition-colors" />
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Agents section ───────────────────────────────────────────────────────────

// Mock request counts (in real life would come from telemetry)
const mockReqs: Record<string, { requests: number; status: "active"|"idle"|"error" }> = {
  "1": { requests: 48, status: "active"  },
  "2": { requests: 19, status: "idle"    },
  "3": { requests: 31, status: "active"  },
  "4": { requests: 12, status: "idle"    },
  "5": { requests:  7, status: "error"   },
}

function AgentsCard() {
  const router = useRouter()
  const { agents } = useAgents()

  if (agents.length === 0) {
    return (
      <Card className="bg-background dark:bg-transparent border-border/60 py-0 flex flex-col">
        <CardContent className="p-6 flex flex-col gap-4 flex-1">
          <p className="text-sm font-medium">Агенты</p>
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-6">
            <div className="size-10 rounded-xl bg-muted/40 flex items-center justify-center">
              <Bot className="size-5 text-muted-foreground/40" />
            </div>
            <p className="text-xs text-muted-foreground text-center">Нет агентов</p>
            <Button size="sm" variant="outline" className="gap-1.5 border-border/60"
              onClick={() => router.push("/agents/new")}>
              <Plus className="size-3.5" />
              Создать агента
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background dark:bg-transparent border-border/60 py-0 flex flex-col">
      <CardContent className="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm font-medium">Агенты</p>
          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-muted-foreground gap-1"
            onClick={() => router.push("/agents/new")}>
            <Plus className="size-3" />
            Новый
          </Button>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-h-0 overflow-y-auto">
          {agents.map(agent => {
            const mock = mockReqs[agent.id]
            const status = mock?.status ?? "idle"
            const requests = mock?.requests ?? 0
            return (
              <button
                key={agent.id}
                onClick={() => router.push(`/agents/${agent.id}`)}
                className="flex items-center gap-3 py-2 px-2 rounded-lg hover:bg-muted/30 transition-colors text-left group -mx-2"
              >
                {/* Avatar */}
                <div
                  className="size-7 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-semibold text-white"
                  style={{ backgroundColor: agent.color }}
                >
                  {agent.name.charAt(0).toUpperCase()}
                </div>
                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{agent.name}</p>
                  <p className="text-[10px] text-muted-foreground/60">{requests} запросов сегодня</p>
                </div>
                {/* Status */}
                <div className="shrink-0">
                  {status === "active" && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                  {status === "idle"   && <Clock        className="size-3.5 text-muted-foreground/30" />}
                  {status === "error"  && <XCircle      className="size-3.5 text-destructive/70" />}
                </div>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Activity log ─────────────────────────────────────────────────────────────

function ActivityCard() {
  return (
    <Card className="bg-background dark:bg-transparent border-border/60 py-0 flex flex-col">
      <CardContent className="p-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex items-center justify-between shrink-0">
          <p className="text-sm font-medium">Активность</p>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-0.5">
          {agentLog.map((entry, i) => (
            <div key={i} className="flex items-center gap-3 py-1.5 shrink-0">
              <span className="font-mono text-[10px] text-muted-foreground/40 w-9 shrink-0">{entry.time}</span>
              {/* Icon/avatar */}
              <div
                className="size-5 rounded-md flex items-center justify-center shrink-0 text-[9px] font-semibold text-white"
                style={{ backgroundColor: entry.color }}
              >
                {entry.type === "solution"
                  ? <Server className="size-2.5 text-white" />
                  : <Bot className="size-2.5 text-white" />
                }
              </div>
              <span className="text-[10px] text-muted-foreground/60 shrink-0 hidden sm:block">{entry.name}</span>
              <span className="text-xs text-muted-foreground flex-1 truncate">{entry.text}</span>
              {entry.ms !== null && (
                <span className="text-[10px] text-muted-foreground/30 font-mono shrink-0">
                  {entry.ms >= 1000 ? `${(entry.ms / 1000).toFixed(1)}с` : `${entry.ms}мс`}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const { agents } = useAgents()
  const { solutions } = useSolutions()

  const activeAgents  = agents.length
  const runningSols   = solutions.filter(s => s.status === "running").length
  const totalSols     = solutions.length

  return (
    <AppShell>
      {/* Header */}
      <div className="section-enter flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Сводка</h1>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mb-0.5 shrink-0">
          <FilterButton icon={<CalendarDays className="size-3.5" />}>За текущий месяц</FilterButton>
          <Button size="sm" variant="outline" className="gap-2 h-9 border-border/60 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => router.push("/catalog")}>
            <LayoutGrid className="size-3.5" />
            Каталог решений
          </Button>
          <Button size="sm" className="gap-2 h-9 shrink-0" onClick={() => router.push("/agents/new")}>
            <Plus className="size-3.5" />
            Новый агент
          </Button>
        </div>
      </div>

      <div className="section-enter anim-delay-1 flex flex-col gap-4">

        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiCard
            label="Расход за апрель"
            value="6 720 ₽"
            sub="агенты + серверы"
            icon={TrendingUp}
            iconColor="#7c3aed"
            trend="+12% к прошлому месяцу"
            trendUp
          />
          <KpiCard
            label="Баланс"
            value="2 450 ₽"
            sub="~10 дней до пополнения"
            icon={Wallet}
            iconColor="#0ea5e9"
          />
          <KpiCard
            label="Агентов"
            value={String(activeAgents || 5)}
            sub={`${Object.values(mockReqs).filter(m => m.status === "active").length} активных`}
            icon={Bot}
            iconColor="#10b981"
            trend="117 запросов сегодня"
            trendUp
          />
          <KpiCard
            label="Серверов"
            value={totalSols > 0 ? String(totalSols) : "3"}
            sub={totalSols > 0 ? `${runningSols} работает` : "2 работает"}
            icon={Server}
            iconColor="#f97316"
          />
        </div>

        {/* Spending row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Chart */}
          <Card className="md:col-span-2 bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm text-muted-foreground">Расход</p>
                  <p className="text-3xl font-semibold tracking-tight">6 720 ₽</p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: AGENT_COLOR }} />
                    <span className="text-xs text-muted-foreground">Агенты</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full" style={{ backgroundColor: SERVER_COLOR }} />
                    <span className="text-xs text-muted-foreground">Серверы</span>
                  </div>
                </div>
              </div>
              <SpendChart />
            </CardContent>
          </Card>

          {/* Right: breakdown + balance */}
          <Card className="bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-6 flex flex-col gap-5 h-full">
              <p className="text-sm font-medium">Breakdown</p>

              {/* Agents */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: AGENT_COLOR }} />
                    <span className="text-muted-foreground">Агенты (API)</span>
                  </div>
                  <span className="font-mono font-medium">4 250 ₽</span>
                </div>
                <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "63%", backgroundColor: AGENT_COLOR }} />
                </div>
              </div>

              {/* Servers */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full" style={{ backgroundColor: SERVER_COLOR }} />
                    <span className="text-muted-foreground">Серверы</span>
                  </div>
                  <span className="font-mono font-medium">2 470 ₽</span>
                </div>
                <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: "37%", backgroundColor: SERVER_COLOR }} />
                </div>
              </div>

              <div className="border-t border-border/40 pt-4 flex flex-col gap-3 mt-auto">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Баланс</span>
                  <span className="font-mono font-semibold">2 450 ₽</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Прогноз</span>
                  <span className="font-mono text-amber-500">~10 дней</span>
                </div>
                <Button size="sm" className="w-full mt-1">Пополнить баланс</Button>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Resources row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SolutionsCard />
          <AgentsCard />
        </div>

        {/* Activity */}
        <div style={{ height: 280 }} className="flex flex-col">
          <ActivityCard />
        </div>

      </div>
    </AppShell>
  )
}
