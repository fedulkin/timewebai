"use client"

import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { SOLUTIONS, COMING_SOON } from "./solutions-data"
import { cn } from "@/lib/utils"
import { useSolutionColor } from "@/lib/solution-color"

// ─── License badge color ──────────────────────────────────────────────────────

function licenseBadgeClass(license: string) {
  if (license === "MIT") return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
  if (license === "Apache 2.0") return "bg-sky-500/10 text-sky-600 dark:text-sky-400"
  return "bg-muted text-muted-foreground"
}

// ─── Solution card ────────────────────────────────────────────────────────────

function SolutionCard({ solution }: { solution: typeof SOLUTIONS[number] }) {
  const Icon = solution.icon
  const color = useSolutionColor(solution.color, solution.darkColor)
  return (
    <Link
      href={`/catalog/${solution.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-5 hover:border-border hover:shadow-xs transition-all"
    >
      {/* Icon + badges row */}
      <div className="flex items-start justify-between gap-3">
        <div
          className="size-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="size-5" style={{ color }} />
        </div>
        <Badge variant="secondary" className={cn("text-[11px] shrink-0 mt-0.5", licenseBadgeClass(solution.license))}>
          {solution.license}
        </Badge>
      </div>

      {/* Name + category */}
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-sm leading-tight">{solution.name}</p>
        <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider font-medium">{solution.category}</p>
      </div>

      {/* Tagline */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        {solution.tagline}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <span className="text-xs text-muted-foreground/60">{solution.price}</span>
        <span
          className="text-xs font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color }}
        >
          Подробнее <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  )
}

// ─── Coming soon card ─────────────────────────────────────────────────────────

function ComingSoonCard({ solution }: { solution: typeof COMING_SOON[number] }) {
  const Icon = solution.icon
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border/40 border-dashed bg-muted/20 p-5 opacity-60">
      <div className="flex items-start justify-between gap-3">
        <div
          className="size-11 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${solution.color}12` }}
        >
          <Icon className="size-5" style={{ color: `${solution.color}80` }} />
        </div>
        <Badge variant="secondary" className="text-[11px] shrink-0 mt-0.5 bg-muted text-muted-foreground/60">
          Скоро
        </Badge>
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="font-semibold text-sm leading-tight text-muted-foreground">{solution.name}</p>
        <p className="text-[11px] text-muted-foreground/50 uppercase tracking-wider font-medium">{solution.category}</p>
      </div>
      <p className="text-sm text-muted-foreground/50 leading-relaxed">{solution.tagline}</p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CatalogPage() {
  return (
    <AppShell>
      {/* Header */}
      <div className="section-enter flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Каталог решений</h1>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Готовые open-source AI-инструменты, которые разворачиваются на вашем сервере за несколько минут.
        </p>
      </div>

      {/* Grid */}
      <div className="section-enter anim-delay-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {SOLUTIONS.map(solution => (
          <SolutionCard key={solution.slug} solution={solution} />
        ))}
        {COMING_SOON.map(solution => (
          <ComingSoonCard key={solution.slug} solution={solution} />
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="section-enter anim-delay-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-border/60 bg-background p-6">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">Нужно что-то другое?</p>
          <p className="text-sm text-muted-foreground">
            Мы добавляем новые решения каждый месяц. Напишите нам, если не нашли нужный инструмент.
          </p>
        </div>
        <Button variant="outline" size="sm" className="shrink-0 border-border/60">
          Предложить решение
        </Button>
      </div>
    </AppShell>
  )
}
