"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, ChevronDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { SpendingChart } from "@/components/spending-chart"

// ─── Mock data ────────────────────────────────────────────────────────────────

const agentExpenses = [
  { id: "1", name: "Ассистент по продажам", color: "#7c3aed", amount: "1 620 ₽", pct: 38 },
  { id: "3", name: "Аналитик данных",       color: "#10b981", amount: "1 100 ₽", pct: 26 },
  { id: "2", name: "Контент-менеджер",      color: "#0ea5e9", amount:   "850 ₽", pct: 20 },
  { id: "4", name: "DevOps-ассистент",      color: "#f97316", amount:   "430 ₽", pct: 10 },
  { id: "5", name: "Исследователь",         color: "#ec4899", amount:   "250 ₽", pct:  6 },
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

function AgentAvatar({ name, color, size = "md" }: { name: string; color: string; size?: "sm" | "md" }) {
  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center shrink-0 font-semibold text-white",
        size === "sm" ? "size-6 text-[10px]" : "size-8 text-xs"
      )}
      style={{ backgroundColor: color }}
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

const rubData   = [320, 510, 420, 680, 590, 870, 760, 1020, 940, 1150, 980, 1340, 1180, 1460]
const tokenData = [2.1, 3.4, 2.8, 4.5, 3.9, 5.8, 5.1,  6.8,  6.3,  7.7,  6.6,  8.9,  7.9,  9.7]
const chartDays = ["14","15","16","17","18","19","20","21","22","23","24","25","26","27"]

function DashboardSpendingChart({ mode, fill }: { mode: "rub" | "tokens"; fill?: boolean }) {
  return (
    <SpendingChart
      data={mode === "rub" ? rubData : tokenData}
      days={chartDays}
      fill={fill}
      gradientId={mode === "rub" ? "spendGradRub" : "spendGradTok"}
      formatTick={v =>
        mode === "rub"
          ? v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v).toString()
          : v.toFixed(1)
      }
      formatLabel={v =>
        mode === "rub" ? `${v.toLocaleString("ru")} ₽` : `${v} M`
      }
    />
  )
}

// ─── Stats row ────────────────────────────────────────────────────────────────

function StatsRow() {
  const [mode, setMode] = useState<"rub" | "tokens">("rub")

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Расход */}
      <Card className="md:col-span-2 bg-background dark:bg-transparent border-border/60 py-0 gap-0 flex flex-col">
        <div className="px-6 pt-6 pb-3 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Расход</p>
            <div className="flex items-center rounded-lg bg-muted/40 p-0.5 gap-0.5">
              {(["rub", "tokens"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    mode === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}>
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
          <DashboardSpendingChart mode={mode} fill />
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
        <h1 className="text-2xl font-semibold tracking-tight">Дашборд</h1>
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 -mb-0.5 shrink-0">
          <FilterButton icon={<CalendarDays className="size-3.5" />}>За текущий месяц</FilterButton>
          <FilterButton>По всем агентам</FilterButton>
          <Button size="sm" className="gap-2 h-9 shrink-0" onClick={() => router.push("/agents/new")}>
            <Plus className="size-3.5" />
            Новый агент
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="section-enter anim-delay-1">
        <StatsRow />
      </div>

      {/* Bottom row */}
      <div className="section-enter anim-delay-2 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Расходы по агентам */}
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col gap-5">
            <p className="text-sm font-medium">Расходы по агентам</p>
            <div className="flex flex-col gap-3">
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
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Активность агентов</p>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Live</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {agentLog.map((entry, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
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
    </AppShell>
  )
}
