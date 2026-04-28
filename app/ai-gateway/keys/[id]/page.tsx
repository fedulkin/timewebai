"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { SpendingChart } from "@/components/spending-chart"
import { ChevronLeft, Key, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data ────────────────────────────────────────────────────────────────

const rubData    = [180, 240, 310, 420, 390, 510, 480, 620, 590, 710, 680, 830, 760, 920]
const tokenData  = [1.2, 1.6, 2.1, 2.8, 2.6, 3.4, 3.2, 4.1, 3.9, 4.7, 4.5, 5.5, 5.1, 6.1]
const chartDays  = ["14","15","16","17","18","19","20","21","22","23","24","25","26","27"]

const mockKey = {
  id: "1",
  name: "production",
  suffix: "a3f9",
  limitTokens: 500_000,
  resetPeriod: "month" as const,
  expiry: "never",
  status: "active" as const,
  createdAt: "2026-03-14",
  totalSpent: "6 820 ₽",
  totalTokens: "45.6 M",
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SLIDER_MAX  = 1_000_000
const SLIDER_STEP = 10_000

function fmtTokens(n: number) {
  if (n === 0) return "Без лимита"
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)} M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1)} K`
  return String(n)
}

// ─── Chart widget ─────────────────────────────────────────────────────────────

function ChartWidget({
  title, total, data, days, gradientId, formatTick, formatLabel,
}: {
  title: string
  total: string
  data: number[]
  days: string[]
  gradientId: string
  formatTick: (v: number) => string
  formatLabel: (v: number) => string
}) {
  return (
    <Card className="bg-background dark:bg-transparent border-border/60 py-0 gap-0 flex flex-col">
      <div className="px-6 pt-6 pb-3 flex flex-col gap-3 shrink-0">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-semibold tracking-tight">{total}</p>
      </div>
      <div className="flex-1 min-h-0 pb-4">
        <SpendingChart
          data={data}
          days={days}
          fill
          gradientId={gradientId}
          formatTick={formatTick}
          formatLabel={formatLabel}
        />
      </div>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function KeyDetailPage() {
  const [name, setName]               = useState(mockKey.name)
  const [limitTokens, setLimitTokens] = useState(mockKey.limitTokens)
  const [resetPeriod, setResetPeriod] = useState(mockKey.resetPeriod)
  const [expiry, setExpiry]           = useState(mockKey.expiry)

  return (
    <AppShell>
      {/* Header */}
      <div className="section-enter flex flex-col gap-4">
        <Link
          href="/ai-gateway"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ChevronLeft className="size-4" />
          AI Gateway
        </Link>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl p-2.5 bg-primary/10">
              <Key className="size-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{mockKey.name}</h1>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium",
                    mockKey.status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {mockKey.status === "active" ? "Активный" : "Истёк"}
                </Badge>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                twai-••••••••-••••-••••-{mockKey.suffix}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground hidden md:block">Создан {mockKey.createdAt}</p>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="section-enter anim-delay-1 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: 220 }}>
        <ChartWidget
          title="Расход средств"
          total={mockKey.totalSpent}
          data={rubData}
          days={chartDays}
          gradientId="keyRubGrad"
          formatTick={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : Math.round(v).toString()}
          formatLabel={v => `${v.toLocaleString("ru")} ₽`}
        />
        <ChartWidget
          title="Расход токенов"
          total={mockKey.totalTokens}
          data={tokenData}
          days={chartDays}
          gradientId="keyTokGrad"
          formatTick={v => v.toFixed(1)}
          formatLabel={v => `${v} M`}
        />
      </div>

      {/* Settings */}
      <div className="section-enter anim-delay-2 flex flex-col gap-6">
        <h2 className="text-base font-semibold">Настройки ключа</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* General */}
          <Card className="bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-6 flex flex-col gap-5">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-[11px]">Основное</p>

              <div className="flex flex-col gap-2">
                <Label htmlFor="key-name">Название</Label>
                <Input
                  id="key-name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="font-mono"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="key-expiry">Срок действия</Label>
                <Select value={expiry} onValueChange={setExpiry}>
                  <SelectTrigger id="key-expiry" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Бессрочный</SelectItem>
                    <SelectItem value="1h">1 час</SelectItem>
                    <SelectItem value="1d">1 день</SelectItem>
                    <SelectItem value="1w">1 неделя</SelectItem>
                    <SelectItem value="1m">1 месяц</SelectItem>
                    <SelectItem value="90d">90 дней</SelectItem>
                    <SelectItem value="180d">180 дней</SelectItem>
                    <SelectItem value="1y">1 год</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Limits */}
          <Card className="bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-6 flex flex-col gap-5">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide text-[11px]">Лимиты</p>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>Лимит токенов</Label>
                  <span className="font-mono text-sm text-primary">{fmtTokens(limitTokens)}</span>
                </div>
                <Slider
                  min={0}
                  max={SLIDER_MAX}
                  step={SLIDER_STEP}
                  value={[limitTokens]}
                  onValueChange={([v]) => setLimitTokens(v)}
                />
                <p className="text-xs text-muted-foreground">0 — без лимита</p>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="key-reset">Сброс лимита</Label>
                <Select value={resetPeriod} onValueChange={v => setResetPeriod(v as typeof resetPeriod)}>
                  <SelectTrigger id="key-reset" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Каждый день</SelectItem>
                    <SelectItem value="week">Каждую неделю</SelectItem>
                    <SelectItem value="month">Каждый месяц</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button onClick={() => {}}>
            Сохранить изменения
          </Button>
        </div>
      </div>
    </AppShell>
  )
}
