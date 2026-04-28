"use client"

import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Workflow, Zap, GitBranch, Lock, Puzzle, RefreshCw,
  ArrowRight, Check, Server, Code2, MousePointerClick,
} from "lucide-react"

const features = [
  {
    icon: MousePointerClick,
    title: "Визуальный редактор",
    description: "Стройте сложные автоматизации перетаскиванием блоков — без единой строки кода.",
  },
  {
    icon: Puzzle,
    title: "400+ интеграций",
    description: "Slack, Notion, GitHub, Google Sheets, PostgreSQL и сотни других сервисов из коробки.",
  },
  {
    icon: Zap,
    title: "AI-узлы",
    description: "Подключайте GPT-4o, Claude, Gemini и другие модели через Timeweb AI Gateway прямо в воркфлоу.",
  },
  {
    icon: Lock,
    title: "Self-hosted",
    description: "Все данные остаются на вашем сервере. Полный контроль над конфигурацией и безопасностью.",
  },
  {
    icon: RefreshCw,
    title: "Триггеры и расписания",
    description: "Запускайте воркфлоу по webhook, cron, событию в БД или вручную — в любой момент.",
  },
  {
    icon: GitBranch,
    title: "Ветвление и циклы",
    description: "Условия, циклы, параллельные ветки — полная логика без ограничений.",
  },
]

const steps = [
  {
    number: "01",
    title: "Разверните инстанс",
    description: "Один клик — и n8n запущен на выделенном сервере Timeweb с настроенной базой данных и SSL.",
  },
  {
    number: "02",
    title: "Подключите AI Gateway",
    description: "Добавьте ваш Timeweb AI API-ключ в настройки — все модели сразу доступны в AI-узлах.",
  },
  {
    number: "03",
    title: "Стройте воркфлоу",
    description: "Открывайте редактор и автоматизируйте всё что нужно: от уведомлений до агентов на базе LLM.",
  },
]

export default function N8nPage() {
  return (
    <AppShell>
      {/* Hero */}
      <div className="section-enter flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-2xl bg-[#EA4B71]/10 flex items-center justify-center shrink-0">
              <Workflow className="size-8 text-[#EA4B71]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">n8n</h1>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs">
                  Доступно
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Автоматизация воркфлоу с поддержкой AI</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="lg" className="gap-2 bg-[#EA4B71] hover:bg-[#EA4B71]/90 text-white">
              Развернуть
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border/60" asChild>
              <a href="https://n8n.io" target="_blank" rel="noopener noreferrer">
                Документация
              </a>
            </Button>
          </div>
        </div>

        {/* Description */}
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col md:flex-row gap-6">
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              n8n — open-source платформа для автоматизации процессов с визуальным редактором воркфлоу.
              В отличие от Zapier или Make, n8n разворачивается на вашей инфраструктуре, даёт полный
              контроль над данными и не ограничивает количество выполнений.
            </p>
            <div className="flex flex-col gap-2 shrink-0">
              {[
                "Неограниченные воркфлоу",
                "Неограниченные выполнения",
                "Исходный код открыт",
                "Интеграция с Timeweb AI",
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-3.5 text-emerald-500 shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="section-enter anim-delay-1 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Возможности</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f) => (
            <Card key={f.title} className="bg-background dark:bg-transparent border-border/60 py-0">
              <CardContent className="p-5 flex flex-col gap-3">
                <div className="size-9 rounded-lg bg-[#EA4B71]/10 flex items-center justify-center">
                  <f.icon className="size-4 text-[#EA4B71]" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{f.title}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How to start */}
      <div className="section-enter anim-delay-2 flex flex-col gap-4">
        <h2 className="text-base font-semibold">Как начать</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {steps.map((s) => (
            <Card key={s.number} className="bg-background dark:bg-transparent border-border/60 py-0">
              <CardContent className="p-5 flex flex-col gap-3">
                <span className="font-mono text-3xl font-bold text-[#EA4B71]/20 leading-none">{s.number}</span>
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
      <div className="section-enter anim-delay-3">
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col gap-1.5">
              <p className="text-base font-semibold">Готовы запустить n8n?</p>
              <p className="text-sm text-muted-foreground">
                Инстанс разворачивается за пару минут. Подключение к AI Gateway включено.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Server className="size-4" />
                <span>От 1 vCPU / 2 GB RAM</span>
              </div>
              <Button size="lg" className="gap-2 bg-[#EA4B71] hover:bg-[#EA4B71]/90 text-white">
                Развернуть сейчас
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
