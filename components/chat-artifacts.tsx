"use client"

import {
  Search, Newspaper, Send, Mail, Hash, Database, Table2, Globe,
  CalendarDays, FileText, GitPullRequest, Code2, Monitor,
  ExternalLink, FileSpreadsheet, MessageSquare, Terminal, Globe2,
  CheckCircle2,
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

// ─── Mock artifacts per skill ─────────────────────────────────────────────────

type Artifact = {
  icon: React.ElementType
  title: string
  meta: string
  url?: string
  time: string
}

const MOCK_ARTIFACTS: Record<string, Artifact[]> = {
  "web-search": [
    { icon: ExternalLink, title: "Как увеличить конверсию в B2B-продажах", meta: "vc.ru", url: "#", time: "2 мин назад" },
    { icon: ExternalLink, title: "Топ-10 техник холодных звонков 2024", meta: "habr.com", url: "#", time: "4 мин назад" },
    { icon: ExternalLink, title: "CRM-системы: сравнение для малого бизнеса", meta: "tinkoff.ru", url: "#", time: "6 мин назад" },
  ],
  "news-search": [
    { icon: ExternalLink, title: "Рынок SaaS в России вырос на 34% за год", meta: "rbc.ru", url: "#", time: "5 мин назад" },
    { icon: ExternalLink, title: "Новые инструменты автоматизации продаж", meta: "cnews.ru", url: "#", time: "8 мин назад" },
  ],
  "email": [
    { icon: CheckCircle2, title: "Коммерческое предложение отправлено", meta: "→ ivan@company.ru", time: "1 мин назад" },
    { icon: CheckCircle2, title: "Follow-up письмо", meta: "→ maria@startup.io", time: "10 мин назад" },
  ],
  "telegram": [
    { icon: CheckCircle2, title: "Уведомление отправлено в канал", meta: "#продажи", time: "3 мин назад" },
    { icon: CheckCircle2, title: "Отчёт за день отправлен", meta: "@sales_bot", time: "15 мин назад" },
  ],
  "slack": [
    { icon: CheckCircle2, title: "Сообщение отправлено", meta: "#general", time: "2 мин назад" },
    { icon: CheckCircle2, title: "Статус обновлён", meta: "#deals", time: "7 мин назад" },
  ],
  "postgres": [
    { icon: Terminal, title: "SELECT * FROM clients WHERE status = 'active'", meta: "42 строки · 0.12 с", time: "3 мин назад" },
    { icon: Terminal, title: "SELECT SUM(amount) FROM orders WHERE month = 4", meta: "1 строка · 0.05 с", time: "5 мин назад" },
  ],
  "google-sheets": [
    { icon: FileSpreadsheet, title: "CRM_Клиенты_Апрель.xlsx", meta: "Обновлено 3 строки", url: "#", time: "4 мин назад" },
    { icon: FileSpreadsheet, title: "Отчёт_продажи_Q1.xlsx", meta: "Добавлено 7 строк", url: "#", time: "9 мин назад" },
  ],
  "http": [
    { icon: Globe2, title: "POST /api/v1/leads", meta: "200 OK · 134 мс", time: "1 мин назад" },
    { icon: Globe2, title: "GET /api/v1/contacts?limit=50", meta: "200 OK · 89 мс", time: "4 мин назад" },
  ],
  "google-calendar": [
    { icon: CheckCircle2, title: "Демо-звонок с Иваном Петровым", meta: "Завтра, 14:00–15:00", url: "#", time: "2 мин назад" },
    { icon: CheckCircle2, title: "Встреча команды продаж", meta: "Пт, 10:00–11:00", url: "#", time: "8 мин назад" },
  ],
  "notion": [
    { icon: FileText, title: "Анализ конкурентов Q2 2024", meta: "База знаний → Продажи", url: "#", time: "3 мин назад" },
    { icon: FileText, title: "Скрипт холодного звонка", meta: "База знаний → Скрипты", url: "#", time: "11 мин назад" },
  ],
  "github": [
    { icon: GitPullRequest, title: "Issue #142: Ошибка в расчёте скидки", meta: "mycompany/backend", url: "#", time: "5 мин назад" },
    { icon: GitPullRequest, title: "Issue #143: Добавить экспорт в CSV", meta: "mycompany/backend", url: "#", time: "9 мин назад" },
  ],
  "code-exec": [
    { icon: Terminal, title: "Расчёт конверсии воронки", meta: "Python · 0.3 с", time: "2 мин назад" },
    { icon: Terminal, title: "Построение графика продаж", meta: "Python · 1.1 с", time: "6 мин назад" },
  ],
  "browser": [
    { icon: Globe2, title: "linkedin.com/company/acme-corp", meta: "Скриншот сохранён", url: "#", time: "4 мин назад" },
    { icon: Globe2, title: "hh.ru/vacancy/12345678", meta: "Контент считан", url: "#", time: "8 мин назад" },
  ],
}

// ─── Artifact item ────────────────────────────────────────────────────────────

function ArtifactItem({ artifact }: { artifact: Artifact }) {
  const Icon = artifact.icon
  const content = (
    <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg hover:bg-muted/40 transition-colors group cursor-pointer">
      <Icon className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/50" />
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <p className="text-xs text-foreground/80 leading-snug truncate group-hover:text-foreground transition-colors">
          {artifact.title}
        </p>
        <p className="text-[11px] text-muted-foreground/50 truncate">{artifact.meta}</p>
      </div>
      {artifact.url && (
        <ExternalLink className="size-3 shrink-0 mt-0.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </div>
  )

  if (artifact.url) {
    return <a href={artifact.url} target="_blank" rel="noopener noreferrer">{content}</a>
  }
  return content
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ChatArtifactsProps {
  skills: AgentSkill[]
}

export function ChatArtifacts({ skills }: ChatArtifactsProps) {
  const skillIds = skills.map(s => s.id)
  const sections = skillIds
    .map(id => ({ skill: SKILLS.find(s => s.id === id), artifacts: MOCK_ARTIFACTS[id] ?? [] }))
    .filter(s => s.skill && s.artifacts.length > 0)

  if (sections.length === 0) return null

  return (
    <div className="w-64 shrink-0 border-l border-border/40 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border/40 shrink-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Артефакты</p>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto py-3">
        {sections.map(({ skill, artifacts }, i) => (
          <div key={skill!.id} className={cn("flex flex-col", i > 0 && "mt-4")}>
            {/* Skill label */}
            <div className="flex items-center gap-2 px-3 mb-1">
              <div
                className="size-4 rounded flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${skill!.color}20` }}
              >
                <SkillIcon
                  name={skill!.icon}
                  className="size-2.5"
                  style={{ color: skill!.color }}
                />
              </div>
              <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider truncate">
                {skill!.connector}
              </p>
            </div>

            {/* Artifacts */}
            {artifacts.map((artifact, j) => (
              <ArtifactItem key={j} artifact={artifact} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
