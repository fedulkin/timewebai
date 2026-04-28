"use client"

import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Globe, Brain, Code2, Shield, Timer, BarChart3,
  ArrowRight, Check, Server, Layers,
} from "lucide-react"

const features = [
  {
    icon: Globe,
    title: "Умный парсинг",
    description: "Извлекает данные с любых сайтов — даже с динамическим контентом на JavaScript.",
  },
  {
    icon: Brain,
    title: "AI-обработка",
    description: "LLM-пайплайн автоматически структурирует, фильтрует и обогащает собранные данные.",
  },
  {
    icon: Code2,
    title: "REST API",
    description: "Запускайте задачи, получайте результаты и управляйте расписанием через простой API.",
  },
  {
    icon: Timer,
    title: "Расписание",
    description: "Настраивайте регулярный сбор данных по cron — результаты автоматически попадают в вашу БД.",
  },
  {
    icon: Shield,
    title: "Антидетект",
    description: "Ротация прокси, имитация браузера и обход CAPTCHA для стабильного сбора данных.",
  },
  {
    icon: BarChart3,
    title: "Мониторинг",
    description: "Дашборд с метриками выполнений, ошибок и объёма обработанных данных в реальном времени.",
  },
]

const steps = [
  {
    number: "01",
    title: "Разверните инстанс",
    description: "OpenClaw запускается на вашем сервере Timeweb с готовой конфигурацией и веб-интерфейсом.",
  },
  {
    number: "02",
    title: "Подключите AI Gateway",
    description: "Укажите API-ключ Timeweb AI — модели будут использоваться для парсинга и обработки данных.",
  },
  {
    number: "03",
    title: "Создайте задачу",
    description: "Задайте URL, правила извлечения и AI-промпт для обработки. Запустите вручную или по расписанию.",
  },
]

const useCases = [
  "Мониторинг цен конкурентов",
  "Агрегация новостей и публикаций",
  "Сбор данных для обучения моделей",
  "Мониторинг отзывов и упоминаний",
]

export default function OpenClawPage() {
  return (
    <AppShell>
      {/* Hero */}
      <div className="section-enter flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Layers className="size-8 text-primary" />
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-bold tracking-tight">OpenClaw</h1>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
                  Бета
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">AI-агент для сбора и обработки веб-данных</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button size="lg" className="gap-2">
              Развернуть
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-border/60">
              Документация
            </Button>
          </div>
        </div>

        {/* Description */}
        <Card className="bg-background dark:bg-transparent border-border/60 py-0">
          <CardContent className="p-6 flex flex-col md:flex-row gap-6">
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">
              OpenClaw — self-hosted платформа для интеллектуального сбора веб-данных с встроенным
              AI-пайплайном. Подключается к Timeweb AI Gateway для обработки извлечённых данных
              с помощью LLM: структурирует, резюмирует, классифицирует и отвечает на вопросы по контенту.
            </p>
            <div className="flex flex-col gap-2 shrink-0">
              {useCases.map(u => (
                <div key={u} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-3.5 text-primary shrink-0" />
                  {u}
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
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="size-4 text-primary" />
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
                <span className="font-mono text-3xl font-bold text-primary/15 leading-none">{s.number}</span>
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
              <p className="text-base font-semibold">Готовы начать сбор данных?</p>
              <p className="text-sm text-muted-foreground">
                Разворачивается за несколько минут. AI-обработка через Timeweb AI включена.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Server className="size-4" />
                <span>От 2 vCPU / 4 GB RAM</span>
              </div>
              <Button size="lg" className="gap-2">
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
