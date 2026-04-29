"use client"

import { use, useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ArrowRight, Check, Server, ChevronLeft, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SOLUTIONS } from "../solutions-data"
import { useSolutions } from "@/components/solutions-provider"
import { cn } from "@/lib/utils"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function licenseBadgeClass(license: string) {
  if (license === "MIT") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  if (license === "Apache 2.0") return "bg-sky-500/10 text-sky-600 dark:text-sky-400"
  return "bg-muted text-muted-foreground"
}

const TIERS = [
  { id: "basic",    label: "Базовый",    specs: "2 vCPU / 4 GB RAM",  price: "1 990 ₽/мес",  note: "Для старта и тестирования" },
  { id: "standard", label: "Стандарт",   specs: "4 vCPU / 8 GB RAM",  price: "3 490 ₽/мес",  note: "Рекомендуем для работы" },
  { id: "pro",      label: "Pro",        specs: "8 vCPU / 16 GB RAM", price: "6 990 ₽/мес",  note: "Высокая нагрузка" },
]

// ─── Deploy dialog ────────────────────────────────────────────────────────────

function DeployDialog({
  open, onOpenChange, solution,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  solution: typeof SOLUTIONS[number]
}) {
  const router = useRouter()
  const { deploy } = useSolutions()
  const [name, setName]         = useState(solution.name)
  const [tierId, setTierId]     = useState("standard")
  const [step, setStep]         = useState<"pick" | "deploying">("pick")
  const [progress, setProgress] = useState(0)

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open)  { setName(solution.name) }
    if (!open) { setStep("pick"); setProgress(0); setTierId("standard") }
  }, [open, solution.name])

  function handleDeploy() {
    const tier = TIERS.find(t => t.id === tierId)!
    setStep("deploying")

    // Animate progress bar
    let pct = 0
    const iv = setInterval(() => {
      pct += Math.random() * 18 + 6
      if (pct >= 100) { pct = 100; clearInterval(iv) }
      setProgress(Math.min(pct, 100))
    }, 350)

    const instance = deploy(solution.slug, name.trim() || solution.name, tier.label, tier.specs)

    setTimeout(() => {
      clearInterval(iv)
      onOpenChange(false)
      router.push(`/solutions/${instance.id}`)
    }, 3800)
  }

  const Icon = solution.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-md overflow-hidden">

        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${solution.color}12 0%, ${solution.color}06 100%)` }}
        >
          <div
            className="size-11 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${solution.color}20` }}
          >
            <Icon className="size-5" style={{ color: solution.color }} />
          </div>
          <div>
            <DialogTitle className="text-base font-semibold">Развернуть {solution.name}</DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">Выберите конфигурацию сервера</p>
          </div>
        </div>

        {step === "pick" ? (
          <>
            {/* Name + Tier selector */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="deploy-name" className="text-sm">Название</Label>
                <Input
                  id="deploy-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={solution.name}
                  className="h-9 text-sm"
                />
              </div>

              {/* Tiers */}
              <div className="flex flex-col gap-3">
              {TIERS.map(tier => (
                <button
                  key={tier.id}
                  onClick={() => setTierId(tier.id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
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
                    <span className="text-xs text-muted-foreground/50">{tier.note}</span>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
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
              </div>{/* end tiers */}
            </div>{/* end name+tiers */}

            {/* Footer */}
            <div className="px-6 pb-6 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>Отмена</Button>
              <Button
                size="sm"
                className="gap-2"
                style={{ backgroundColor: solution.color, color: "#fff" }}
                onClick={handleDeploy}
              >
                Развернуть
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </>
        ) : (
          /* Deploying state */
          <div className="px-6 py-8 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Разворачиваем {solution.name}...</span>
                <span className="font-mono text-xs text-muted-foreground">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%`, backgroundColor: solution.color }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { label: "Создание сервера",       done: progress > 20 },
                { label: "Установка зависимостей", done: progress > 50 },
                { label: "Настройка окружения",    done: progress > 75 },
                { label: "Запуск сервисов",         done: progress >= 100 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm">
                  <div className={cn(
                    "size-4 rounded-full flex items-center justify-center shrink-0 transition-all",
                    item.done ? "bg-emerald-500/20" : "bg-muted"
                  )}>
                    {item.done
                      ? <Check className="size-2.5 text-emerald-500" />
                      : <span className="size-1.5 rounded-full bg-muted-foreground/30" />
                    }
                  </div>
                  <span className={item.done ? "text-foreground" : "text-muted-foreground/50"}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SolutionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params)
  const router = useRouter()
  const solution = SOLUTIONS.find(s => s.slug === slug)
  const [deployOpen, setDeployOpen] = useState(false)

  if (!solution) notFound()

  const Icon = solution.icon

  return (
    <AppShell>
      {/* Back + hero */}
      <div className="section-enter flex flex-col gap-6">
        <button
          onClick={() => router.push("/catalog")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="size-4" />
          Каталог решений
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="size-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${solution.color}18` }}
            >
              <Icon className="size-8" style={{ color: solution.color }} />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{solution.name}</h1>
                <Badge variant="secondary" className={cn("text-xs", licenseBadgeClass(solution.license))}>
                  {solution.license}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-muted/60 text-muted-foreground">
                  {solution.category}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{solution.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="lg"
              className="gap-2"
              style={{ backgroundColor: solution.color, color: "#fff" }}
              onClick={() => setDeployOpen(true)}
            >
              Развернуть
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border/60 gap-2">
              <ExternalLink className="size-4" />
              Документация
            </Button>
          </div>
        </div>
      </div>

      {/* Description + use cases */}
      <Card className="section-enter anim-delay-1 bg-background dark:bg-transparent border-border/60 py-0">
        <CardContent className="p-6 flex flex-col md:flex-row gap-8">
          <p className="text-sm text-muted-foreground leading-relaxed flex-1">
            {solution.description}
          </p>
          <div className="flex flex-col gap-2 md:min-w-[220px]">
            {solution.useCases.map(u => (
              <div key={u} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="size-3.5 shrink-0" style={{ color: solution.color }} />
                {u}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="section-enter anim-delay-2 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Возможности</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {solution.features.map(f => {
            const FIcon = f.icon
            return (
              <Card key={f.title} className="bg-background dark:bg-transparent border-border/60 py-0">
                <CardContent className="p-5 flex flex-col gap-3">
                  <div
                    className="size-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${solution.color}15` }}
                  >
                    <FIcon className="size-4" style={{ color: solution.color }} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">{f.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* How to start */}
      <div className="section-enter anim-delay-3 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Как начать</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {solution.steps.map(s => (
            <Card key={s.number} className="bg-background dark:bg-transparent border-border/60 py-0">
              <CardContent className="p-5 flex flex-col gap-3">
                <span
                  className="font-mono text-3xl font-bold leading-none"
                  style={{ color: `${solution.color}30` }}
                >
                  {s.number}
                </span>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{s.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="section-enter anim-delay-4">
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold">Готовы развернуть {solution.name}?</p>
              <p className="text-sm text-muted-foreground">
                Запускается за несколько минут. Все данные остаются на вашем сервере.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Server className="size-4" />
                <span>{solution.specs}</span>
              </div>
              <Button
                size="lg"
                className="gap-2"
                style={{ backgroundColor: solution.color, color: "#fff" }}
                onClick={() => setDeployOpen(true)}
              >
                Развернуть сейчас
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <DeployDialog
        open={deployOpen}
        onOpenChange={setDeployOpen}
        solution={solution}
      />
    </AppShell>
  )
}
