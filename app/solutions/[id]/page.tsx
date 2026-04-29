"use client"

import { use, useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import {
  ExternalLink, Square, RotateCcw, ChevronLeft,
  Activity, Cpu, MemoryStick, Clock, Settings2, Check,
} from "lucide-react"
import { useSolutions, type DeployedStatus } from "@/components/solutions-provider"
import { SOLUTIONS } from "@/app/catalog/solutions-data"
import { cn } from "@/lib/utils"

// ─── Tiers (same as in deploy dialog) ────────────────────────────────────────

const TIERS = [
  { id: "basic",    label: "Базовый",   specs: "2 vCPU / 4 GB RAM",  price: "1 990 ₽/мес",  note: "Для старта и тестирования" },
  { id: "standard", label: "Стандарт",  specs: "4 vCPU / 8 GB RAM",  price: "3 490 ₽/мес",  note: "Рекомендуем для работы" },
  { id: "pro",      label: "Pro",       specs: "8 vCPU / 16 GB RAM", price: "6 990 ₽/мес",  note: "Высокая нагрузка" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DeployedStatus }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5 text-xs font-medium",
        status === "running"   && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        status === "deploying" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        status === "stopped"   && "bg-muted text-muted-foreground",
      )}
    >
      <span className={cn(
        "size-1.5 rounded-full",
        status === "running"   && "bg-emerald-500",
        status === "deploying" && "bg-amber-400 animate-pulse",
        status === "stopped"   && "bg-muted-foreground/40",
      )} />
      {status === "running"   && "Работает"}
      {status === "deploying" && "Разворачивается"}
      {status === "stopped"   && "Остановлен"}
    </Badge>
  )
}

function MiniBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-1 rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{ width: `${value}%`, backgroundColor: color }}
      />
    </div>
  )
}

// ─── Settings dialog ──────────────────────────────────────────────────────────

function SettingsDialog({
  open, onOpenChange, solution, color, icon: Icon,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  solution: { id: string; name: string; tier: string; specs: string }
  color: string
  icon: React.ElementType | undefined
}) {
  const { update } = useSolutions()
  const [name, setName]   = useState(solution.name)
  const [tierId, setTierId] = useState(
    () => TIERS.find(t => t.label === solution.tier)?.id ?? "standard"
  )

  // Sync when dialog opens
  useEffect(() => {
    if (open) {
      setName(solution.name)
      setTierId(TIERS.find(t => t.label === solution.tier)?.id ?? "standard")
    }
  }, [open, solution.name, solution.tier])

  function handleSave() {
    const tier = TIERS.find(t => t.id === tierId)!
    update(solution.id, {
      name: name.trim() || solution.name,
      tier: tier.label,
      specs: tier.specs,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-md overflow-hidden">
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${color}12 0%, ${color}06 100%)` }}
        >
          <div
            className="size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}20` }}
          >
            {Icon && <Icon className="size-5" style={{ color }} />}
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">Настройки решения</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Имя и конфигурация сервера</p>
          </div>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-5">
          {/* Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="settings-name" className="text-sm">Название</Label>
            <Input
              id="settings-name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-9 text-sm"
              autoFocus
            />
          </div>

          {/* Tier */}
          <div className="flex flex-col gap-2">
            <Label className="text-sm">Конфигурация сервера</Label>
            <div className="flex flex-col gap-2">
              {TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setTierId(tier.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-3.5 text-left transition-all",
                    tierId === tier.id
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/60 bg-background hover:border-border hover:bg-muted/20"
                  )}
                >
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{tier.label}</span>
                      {tier.id === "standard" && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">
                          Рекомендуем
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{tier.specs}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-semibold">{tier.price}</span>
                    <div className={cn(
                      "size-4 rounded-full border-2 flex items-center justify-center transition-all",
                      tierId === tier.id ? "border-primary bg-primary" : "border-border/60"
                    )}>
                      {tierId === tier.id && <Check className="size-2.5 text-primary-foreground" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button
            size="sm"
            onClick={handleSave}
            style={{ backgroundColor: color, color: "#fff" }}
          >
            Сохранить
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Mock activity log ────────────────────────────────────────────────────────

function timeAgo(minutes: number) {
  if (minutes < 60) return `${minutes} мин назад`
  return `${Math.floor(minutes / 60)} ч назад`
}

const MOCK_ACTIVITY = [
  { type: "ok",   text: "Запрос обработан",        detail: "GET /api/v1/status",   minutes: 2  },
  { type: "ok",   text: "Запрос обработан",        detail: "POST /api/v1/tasks",   minutes: 7  },
  { type: "ok",   text: "Резервная копия создана", detail: "Снапшот 128 MB",       minutes: 15 },
  { type: "ok",   text: "Запрос обработан",        detail: "GET /api/v1/agents",   minutes: 23 },
  { type: "warn", text: "Высокая нагрузка CPU",    detail: "82% в течение 30 с",   minutes: 41 },
  { type: "ok",   text: "Запрос обработан",        detail: "POST /api/v1/run",     minutes: 58 },
  { type: "ok",   text: "Сервис перезапущен",      detail: "Плановое обновление",  minutes: 90 },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SolutionInstancePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { getSolution, stop, restart } = useSolutions()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [solution, setSolution] = useState(() => getSolution(id))

  useEffect(() => {
    const interval = setInterval(() => setSolution(getSolution(id)), 500)
    return () => clearInterval(interval)
  }, [id, getSolution])

  if (!solution) notFound()

  const catalogEntry = SOLUTIONS.find(s => s.slug === solution.slug)
  const Icon = catalogEntry?.icon

  const isDeploying = solution.status === "deploying"
  const isRunning   = solution.status === "running"

  const cpuPct  = isRunning ? 14 : 0
  const ramTotal = solution.specs.includes("4 GB") ? 4 : solution.specs.includes("8 GB") ? 8 : 16
  const ramUsed = isRunning ? 1.8 : 0
  const ramPct  = isRunning ? Math.round((ramUsed / ramTotal) * 100) : 0

  const deployedDate = new Date(solution.deployedAt)
  const uptimeMs = isRunning ? Date.now() - deployedDate.getTime() : 0
  const uptimeH  = Math.floor(uptimeMs / 3600000)
  const uptimeMin = Math.floor((uptimeMs % 3600000) / 60000)
  const uptimeStr = isDeploying ? "Разворачивается..."
    : isRunning ? (uptimeH > 0 ? `${uptimeH} ч ${uptimeMin} мин` : `${uptimeMin} мин`)
    : "Остановлен"

  return (
    <AppShell>
      {/* Back */}
      <div className="section-enter flex flex-col gap-6">
        <button
          onClick={() => router.push("/catalog")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="size-4" />
          Каталог решений
        </button>

        {/* Hero */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="size-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${solution.color}18` }}
            >
              {Icon && <Icon className="size-6" style={{ color: solution.color }} />}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight">{solution.name}</h1>
                <StatusBadge status={solution.status} />
              </div>
              <p className="text-xs text-muted-foreground font-mono">{solution.url}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-border/60 text-muted-foreground"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings2 className="size-3.5" />
              Настройки
            </Button>
            {isRunning && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/60"
                onClick={() => window.open(solution.url, "_blank")}
              >
                <ExternalLink className="size-3.5" />
                Открыть
              </Button>
            )}
            {isRunning && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 border-border/60 text-muted-foreground"
                onClick={() => stop(id)}
              >
                <Square className="size-3.5" />
                Остановить
              </Button>
            )}
            {solution.status === "stopped" && (
              <Button
                size="sm"
                className="gap-2"
                style={{ backgroundColor: solution.color, color: "#fff" }}
                onClick={() => restart(id)}
              >
                <RotateCcw className="size-3.5" />
                Запустить
              </Button>
            )}
            {isDeploying && (
              <Button size="sm" variant="outline" disabled className="gap-2 border-border/60">
                <span className="size-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Разворачивается
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="section-enter anim-delay-1 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: Clock,
            label: "Аптайм",
            value: uptimeStr,
            sub: isRunning ? `С ${deployedDate.toLocaleDateString("ru-RU")}` : "—",
          },
          {
            icon: Cpu,
            label: "CPU",
            value: isRunning ? `${cpuPct}%` : "—",
            sub: solution.specs.split(" / ")[0],
            bar: isRunning ? cpuPct : undefined,
          },
          {
            icon: MemoryStick,
            label: "Память",
            value: isRunning ? `${ramUsed} / ${ramTotal} GB` : "—",
            sub: `${ramPct}% использовано`,
            bar: isRunning ? ramPct : undefined,
          },
          {
            icon: Activity,
            label: "Запросов сегодня",
            value: isRunning ? "342" : "—",
            sub: isRunning ? "↑ 18% vs вчера" : "—",
          },
        ].map(m => (
          <Card key={m.label} className="bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-4 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <m.icon className="size-3.5 text-muted-foreground/50 shrink-0" />
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">{m.label}</p>
              </div>
              <p className="text-lg font-semibold leading-none">{m.value}</p>
              {m.bar !== undefined && <MiniBar value={m.bar} color={solution.color} />}
              <p className="text-xs text-muted-foreground/50">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity log */}
      <div className="section-enter anim-delay-2 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Журнал активности</h2>
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-0">
            {isDeploying ? (
              <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground/50 text-sm">
                <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Журнал появится после запуска
              </div>
            ) : solution.status === "stopped" ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground/50 text-sm">
                Сервис остановлен
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {MOCK_ACTIVITY.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3">
                    <span className="text-xs text-muted-foreground/40 w-24 shrink-0 tabular-nums">
                      {timeAgo(item.minutes)}
                    </span>
                    <span className={cn(
                      "size-1.5 rounded-full shrink-0",
                      item.type === "ok" ? "bg-emerald-500" : "bg-amber-400"
                    )} />
                    <span className="text-sm flex-1">{item.text}</span>
                    <span className="text-xs text-muted-foreground/50 font-mono hidden md:block">{item.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Server info */}
      <div className="section-enter anim-delay-3">
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:gap-10">
            {[
              { label: "Тариф",        value: solution.tier },
              { label: "Конфигурация", value: solution.specs },
              { label: "Регион",       value: "Москва, RU" },
              { label: "Развёрнуто",   value: deployedDate.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" }) },
            ].map(item => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <p className="text-xs text-muted-foreground/50 uppercase tracking-wider font-medium">{item.label}</p>
                <p className="text-sm font-medium">{item.value}</p>
              </div>
            ))}
            <div className="sm:ml-auto flex items-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
              >
                Удалить сервер
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        solution={solution}
        color={solution.color}
        icon={Icon}
      />
    </AppShell>
  )
}
