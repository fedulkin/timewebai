"use client"

import { useState } from "react"
import {
  Search, Newspaper, Send, Mail, Hash, Database, Table2, Globe,
  CalendarDays, FileText, GitPullRequest, Code2, Monitor,
  ExternalLink, FileSpreadsheet, Terminal, Globe2,
  CheckCircle2, ChevronDown,
} from "lucide-react"
import { SKILLS } from "@/app/agents/skills-data"
import { type AgentSkill } from "@/components/agents-provider"
import { cn } from "@/lib/utils"

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Newspaper, Send, Mail, Hash, Database, Table2, Globe,
  CalendarDays, FileText, GitPullRequest, Code2, Monitor,
}

function SkillIcon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const Icon = ICON_MAP[name]
  return Icon ? <Icon className={className} style={style} /> : null
}

// ─── Artifact types ───────────────────────────────────────────────────────────

type ArtifactKind = "action" | "result"

type Artifact = {
  kind: ArtifactKind
  icon: React.ElementType
  title: string
  meta: string
  url?: string
  time: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ARTIFACTS: Record<string, Artifact[]> = {
  "web-search": [
    { kind: "result", icon: ExternalLink, title: "Как увеличить конверсию в B2B-продажах", meta: "vc.ru", url: "#", time: "2 мин" },
    { kind: "result", icon: ExternalLink, title: "Топ-10 техник холодных звонков 2024", meta: "habr.com", url: "#", time: "4 мин" },
    { kind: "result", icon: ExternalLink, title: "CRM-системы: сравнение для малого бизнеса", meta: "tinkoff.ru", url: "#", time: "6 мин" },
  ],
  "news-search": [
    { kind: "result", icon: ExternalLink, title: "Рынок SaaS в России вырос на 34% за год", meta: "rbc.ru", url: "#", time: "5 мин" },
    { kind: "result", icon: ExternalLink, title: "Новые инструменты автоматизации продаж", meta: "cnews.ru", url: "#", time: "8 мин" },
  ],
  "email": [
    { kind: "action", icon: CheckCircle2, title: "Коммерческое предложение отправлено", meta: "→ ivan@company.ru", time: "1 мин" },
    { kind: "action", icon: CheckCircle2, title: "Follow-up письмо отправлено", meta: "→ maria@startup.io", time: "10 мин" },
  ],
  "telegram": [
    { kind: "action", icon: CheckCircle2, title: "Уведомление опубликовано", meta: "→ #продажи", time: "3 мин" },
    { kind: "action", icon: CheckCircle2, title: "Отчёт за день отправлен", meta: "→ @sales_bot", time: "15 мин" },
  ],
  "slack": [
    { kind: "action", icon: CheckCircle2, title: "Сообщение отправлено", meta: "→ #general", time: "2 мин" },
    { kind: "action", icon: CheckCircle2, title: "Статус обновлён", meta: "→ #deals", time: "7 мин" },
  ],
  "postgres": [
    { kind: "action", icon: Terminal, title: "SELECT * FROM clients WHERE status = 'active'", meta: "42 строки · 0.12 с", time: "3 мин" },
    { kind: "action", icon: Terminal, title: "SELECT SUM(amount) FROM orders WHERE month = 4", meta: "1 строка · 0.05 с", time: "5 мин" },
  ],
  "google-sheets": [
    { kind: "action", icon: FileSpreadsheet, title: "CRM_Клиенты_Апрель", meta: "Обновлено 3 строки", url: "#", time: "4 мин" },
    { kind: "action", icon: FileSpreadsheet, title: "Отчёт_продажи_Q1", meta: "Добавлено 7 строк", url: "#", time: "9 мин" },
  ],
  "http": [
    { kind: "action", icon: Globe2, title: "POST /api/v1/leads", meta: "200 OK · 134 мс", time: "1 мин" },
    { kind: "action", icon: Globe2, title: "GET /api/v1/contacts?limit=50", meta: "200 OK · 89 мс", time: "4 мин" },
  ],
  "google-calendar": [
    { kind: "action", icon: CheckCircle2, title: "Демо-звонок с Иваном Петровым", meta: "Завтра, 14:00–15:00", url: "#", time: "2 мин" },
    { kind: "action", icon: CheckCircle2, title: "Встреча команды продаж", meta: "Пт, 10:00–11:00", url: "#", time: "8 мин" },
  ],
  "notion": [
    { kind: "action", icon: FileText, title: "Анализ конкурентов Q2 2024", meta: "База знаний → Продажи", url: "#", time: "3 мин" },
    { kind: "action", icon: FileText, title: "Скрипт холодного звонка", meta: "База знаний → Скрипты", url: "#", time: "11 мин" },
  ],
  "github": [
    { kind: "action", icon: GitPullRequest, title: "Issue #142: Ошибка в расчёте скидки", meta: "mycompany/backend", url: "#", time: "5 мин" },
    { kind: "action", icon: GitPullRequest, title: "Issue #143: Добавить экспорт в CSV", meta: "mycompany/backend", url: "#", time: "9 мин" },
  ],
  "code-exec": [
    { kind: "action", icon: Terminal, title: "Расчёт конверсии воронки", meta: "Python · 0.3 с", time: "2 мин" },
    { kind: "action", icon: Terminal, title: "Построение графика продаж", meta: "Python · 1.1 с", time: "6 мин" },
  ],
  "browser": [
    { kind: "result", icon: Globe2, title: "linkedin.com/company/acme-corp", meta: "Страница прочитана", url: "#", time: "4 мин" },
    { kind: "result", icon: Globe2, title: "hh.ru/vacancy/12345678", meta: "Контент считан", url: "#", time: "8 мин" },
  ],
}

// ─── Skill section ────────────────────────────────────────────────────────────

function SkillSection({ skillId, artifacts }: { skillId: string; artifacts: Artifact[] }) {
  const [open, setOpen] = useState(true)
  const skill = SKILLS.find(s => s.id === skillId)
  if (!skill) return null

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden shrink-0 bg-background dark:bg-transparent">
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/30 transition-colors"
      >
        <div
          className="size-5 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${skill.color}20` }}
        >
          <SkillIcon name={skill.icon} className="size-3" style={{ color: skill.color }} />
        </div>
        <span className="flex-1 text-left text-xs font-medium text-foreground/80 truncate">
          {skill.name}
        </span>
        <span className="text-[11px] text-muted-foreground/50 shrink-0 mr-1">
          {artifacts.length}
        </span>
        <ChevronDown
          className={cn("size-3.5 text-muted-foreground/40 shrink-0 transition-transform", !open && "-rotate-90")}
        />
      </button>

      {/* Items */}
      {open && (
        <div className="border-t border-border/40 divide-y divide-border/30">
          {artifacts.map((artifact, i) => (
            <ArtifactItem key={i} artifact={artifact} color={skill.color} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Artifact item ────────────────────────────────────────────────────────────

function ArtifactItem({ artifact, color }: { artifact: Artifact; color: string }) {
  const Icon = artifact.icon
  const isAction = artifact.kind === "action"

  const inner = (
    <div className={cn(
      "flex items-start gap-2.5 px-3 py-2.5 transition-colors group",
      artifact.url ? "cursor-pointer hover:bg-muted/30" : "cursor-default"
    )}>
      {/* Kind indicator */}
      <div className="shrink-0 mt-0.5">
        {isAction ? (
          <Icon className="size-3.5" style={{ color }} />
        ) : (
          <Icon className="size-3.5 text-muted-foreground/40" />
        )}
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className={cn(
          "text-xs leading-snug truncate",
          isAction ? "text-foreground/80" : "text-muted-foreground"
        )}>
          {artifact.title}
        </p>
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-muted-foreground/50 truncate">{artifact.meta}</p>
          <p className="text-[11px] text-muted-foreground/30 shrink-0">{artifact.time}</p>
        </div>
      </div>

      {artifact.url && (
        <ExternalLink className="size-3 shrink-0 mt-0.5 text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )

  return artifact.url
    ? <a href={artifact.url} target="_blank" rel="noopener noreferrer">{inner}</a>
    : inner
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ChatArtifactsProps {
  skills: AgentSkill[]
}

export function ChatArtifacts({ skills }: ChatArtifactsProps) {
  const sections = skills
    .map(s => ({ id: s.id, artifacts: MOCK_ARTIFACTS[s.id] ?? [] }))
    .filter(s => s.artifacts.length > 0)

  if (sections.length === 0) return null

  return (
    <div className="w-64 shrink-0 border-l border-border/40 flex flex-col overflow-hidden h-full">
      {/* Sections */}
      <div className="flex-1 overflow-y-auto min-h-0 p-3 flex flex-col gap-2">
        {sections.map(s => (
          <SkillSection key={s.id} skillId={s.id} artifacts={s.artifacts} />
        ))}
      </div>
    </div>
  )
}
