"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAgents, type AgentSkill } from "@/components/agents-provider"
import { SKILLS, type Skill } from "@/app/agents/skills-data"
import { SkillConfigDialog } from "@/components/skill-config-dialog"
import { SkillsShowcase } from "@/components/skills-showcase"
import {
  Check, ChevronRight, Sparkles, Target, Zap, Rocket,
  Search, Newspaper, Send, Mail, Hash, Database, Table2,
  Globe, CalendarDays, FileText, GitPullRequest, Code2, Monitor,
  Users, PenLine, BarChart2, ListChecks, Settings2,
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Newspaper, Send, Mail, Hash, Database, Table2, Globe,
  CalendarDays, FileText, GitPullRequest, Code2, Monitor,
}

// ─── Goals ────────────────────────────────────────────────────────────────────

type Goal = {
  id: string
  icon: React.ElementType
  color: string
  label: string
  description: string
  systemPrompt: string
  skillIds: string[]
}

const GOALS: Goal[] = [
  {
    id: "sales",
    icon: Users,
    color: "#3b82f6",
    label: "Продажи и клиенты",
    description: "Составляет КП, ведёт переписку, назначает встречи",
    systemPrompt: "Ты опытный менеджер по продажам. Помогаешь составлять коммерческие предложения, вести переписку с клиентами, назначать встречи и закрывать сделки. Общайся дружелюбно и профессионально.",
    skillIds: ["email", "google-calendar", "web-search", "notion"],
  },
  {
    id: "content",
    icon: PenLine,
    color: "#8b5cf6",
    label: "Контент и публикации",
    description: "Пишет посты, следит за новостями, публикует в каналы",
    systemPrompt: "Ты контент-менеджер. Пишешь посты для соцсетей и мессенджеров, следишь за актуальными новостями, адаптируешь материалы под разные аудитории.",
    skillIds: ["news-search", "telegram", "slack", "browser"],
  },
  {
    id: "analytics",
    icon: BarChart2,
    color: "#10b981",
    label: "Аналитика и данные",
    description: "Делает запросы к БД, строит отчёты, пишет скрипты",
    systemPrompt: "Ты аналитик данных. Помогаешь делать запросы к базам данных, строить отчёты, интерпретировать данные и автоматизировать сбор метрик.",
    skillIds: ["postgres", "google-sheets", "code-exec", "http"],
  },
  {
    id: "tasks",
    icon: ListChecks,
    color: "#f59e0b",
    label: "Задачи и проекты",
    description: "Создаёт задачи, уведомляет команду, следит за статусами",
    systemPrompt: "Ты проджект-ассистент. Помогаешь управлять задачами, создавать тикеты, уведомлять команду о важных событиях и следить за прогрессом проектов.",
    skillIds: ["github", "slack", "notion", "google-calendar"],
  },
  {
    id: "research",
    icon: Globe,
    color: "#06b6d4",
    label: "Исследования и поиск",
    description: "Ищет информацию в интернете, анализирует сайты, сохраняет",
    systemPrompt: "Ты исследователь. Ищешь актуальную информацию в интернете, анализируешь сайты, структурируешь данные и сохраняешь результаты в базу знаний.",
    skillIds: ["web-search", "news-search", "browser", "notion"],
  },
  {
    id: "automation",
    icon: Settings2,
    color: "#ef4444",
    label: "Автоматизация",
    description: "Вызывает API, запускает скрипты, отправляет уведомления",
    systemPrompt: "Ты специалист по автоматизации. Помогаешь настраивать интеграции, вызывать внешние API, запускать скрипты и автоматизировать повторяющиеся задачи.",
    skillIds: ["http", "code-exec", "email", "slack"],
  },
]

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = ["Знакомство", "Цель", "Умения", "Запуск"]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done    = i < current
        const active  = i === current
        return (
          <div key={i} className="flex items-center">
            <div className="flex items-center gap-2">
              <div className={cn(
                "size-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                done   && "bg-primary text-primary-foreground",
                active && "bg-primary/15 text-primary ring-2 ring-primary/30",
                !done && !active && "bg-muted/60 text-muted-foreground/50",
              )}>
                {done ? <Check className="size-3" /> : i + 1}
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors hidden sm:block",
                active  ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn(
                "h-px w-8 md:w-12 mx-2 transition-colors",
                i < current ? "bg-primary/40" : "bg-border/60"
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Skill toggle card ────────────────────────────────────────────────────────

function SkillToggle({
  skillId, selected, onToggle,
}: {
  skillId: string
  selected: boolean
  onToggle: (id: string) => void
}) {
  const skill = SKILLS.find(s => s.id === skillId)
  if (!skill) return null
  const Icon = ICON_MAP[skill.icon]

  return (
    <button
      onClick={() => onToggle(skillId)}
      className={cn(
        "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
        selected
          ? "border-primary/50 bg-primary/5"
          : "border-border/60 bg-background hover:border-border hover:bg-muted/20"
      )}
    >
      <div className="size-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${skill.color}18` }}>
        {Icon && <Icon className="size-4" style={{ color: skill.color }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium leading-tight">{skill.name}</p>
        <p className="text-[11px] text-muted-foreground/60 leading-tight mt-0.5 truncate">{skill.description}</p>
      </div>
      <div className={cn(
        "size-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-all",
        selected ? "border-primary bg-primary" : "border-border/60"
      )}>
        {selected && <Check className="size-2.5 text-primary-foreground" />}
      </div>
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewAgentPage() {
  const router = useRouter()
  const { createAgent } = useAgents()

  const [step, setStep]               = useState(0)
  const [name, setName]               = useState("")
  const [description, setDescription] = useState("")
  const [goalId, setGoalId]           = useState<string | null>(null)
  const [customGoal, setCustomGoal]   = useState("")
  const [skills, setSkills]           = useState<AgentSkill[]>([])
  const [dialogSkill, setDialogSkill] = useState<Skill | null>(null)

  const goal = GOALS.find(g => g.id === goalId)

  function selectGoal(id: string) {
    setGoalId(prev => prev === id ? null : id)
  }

  function handleConnect(skillId: string, config: Record<string, string>) {
    setSkills(prev => {
      const exists = prev.find(s => s.id === skillId)
      return exists
        ? prev.map(s => s.id === skillId ? { ...s, config } : s)
        : [...prev, { id: skillId, config }]
    })
  }

  function handleDisconnect(skillId: string) {
    setSkills(prev => prev.filter(s => s.id !== skillId))
  }

  function handleCreate() {
    const agentName = name.trim() || (goal?.label ?? "Мой агент")
    const systemPrompt = goal?.systemPrompt ?? customGoal.trim()
    const agent = createAgent({
      name: agentName,
      description: description.trim(),
      model: "openai/gpt-4o",
      systemPrompt,
      color: "#7c3aed",
      skills,
    })
    router.push(`/agents/${agent.id}`)
  }

  const canNext0 = name.trim().length > 0
  const canNext1 = goalId !== null || customGoal.trim().length > 0

  const recommendedIds = goal?.skillIds ?? []
  const selectedIds    = skills.map(s => s.id)

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-center justify-between">
        <StepIndicator current={step} />
        <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => router.back()}>
          Отмена
        </Button>
      </div>

      {/* ── Step 0: Знакомство ── */}
      {step === 0 && (
        <div className="flex flex-col gap-6 max-w-xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-4 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Создайте своего помощника</h1>
            <p className="text-muted-foreground leading-relaxed">
              Агент — это ваш персональный ИИ-ассистент. Он понимает задачи на естественном языке, умеет пользоваться инструментами и работает так, как вы ему объясните. Представьте, что вы нанимаете сотрудника: дайте ему имя, объясните, чем он будет заниматься — и он сразу начнёт помогать.
            </p>
          </div>

          <div className="flex flex-col gap-7">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Как назовёте помощника?</label>
              <Input
                placeholder="Например: Помощник по продажам"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                className="h-11 text-sm"
                onKeyDown={e => e.key === "Enter" && canNext0 && setStep(1)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-muted-foreground">Коротко — чем он будет заниматься? <span className="text-muted-foreground/50">(необязательно)</span></label>
              <Input
                placeholder="Например: помогает писать письма клиентам"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="h-11 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Цель ── */}
      {step === 1 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="size-4 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Какова главная цель агента?</h1>
            <p className="text-muted-foreground leading-relaxed">
              Выберите наиболее близкое направление — мы подберём подходящие инструменты. Всё можно изменить потом.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {GOALS.map(g => {
              const Icon = g.icon
              const selected = goalId === g.id
              return (
                <button
                  key={g.id}
                  onClick={() => selectGoal(g.id)}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border p-4 text-left transition-all",
                    selected
                      ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                      : "border-border/60 bg-background hover:border-border hover:bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="size-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${g.color}18` }}
                    >
                      <Icon className="size-5" style={{ color: g.color }} />
                    </div>
                    {selected && (
                      <div className="size-5 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="size-3 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{g.label}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{g.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 max-w-xl">
            <label className="text-sm font-medium text-muted-foreground">Дополнительный контекст <span className="text-muted-foreground/50">(необязательно)</span></label>
            <Textarea
              placeholder="Например: помогает HR-менеджеру обрабатывать резюме и назначать собеседования..."
              value={customGoal}
              onChange={e => setCustomGoal(e.target.value)}
              className="resize-none text-sm leading-relaxed min-h-[80px]"
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Умения ── */}
      {step === 2 && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="size-4 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Подключите умения</h1>
            <p className="text-muted-foreground leading-relaxed">
              Умения — это инструменты, которые агент использует для выполнения задач. Нажмите на карточку, чтобы настроить и подключить умение. Этот шаг можно пропустить и подключить умения позже в настройках агента.
            </p>
          </div>

          {recommendedIds.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-medium">
                Рекомендованные для «{goal?.label}»
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {recommendedIds.map(id => {
                  const skill = SKILLS.find(s => s.id === id)
                  if (!skill) return null
                  const Icon = ICON_MAP[skill.icon]
                  const connected = selectedIds.includes(id)
                  return (
                    <button
                      key={id}
                      onClick={() => setDialogSkill(skill)}
                      className={cn(
                        "flex flex-col gap-3 rounded-xl border p-4 text-left transition-all",
                        connected
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/60 bg-background hover:border-border hover:bg-muted/20"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="size-9 rounded-lg flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${skill.color}18` }}>
                          {Icon && <Icon className="size-4" style={{ color: skill.color }} />}
                        </div>
                        {connected && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary shrink-0">
                            добавлено
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-tight">{skill.name}</p>
                        <p className="text-xs text-muted-foreground/70 mt-0.5 leading-relaxed">{skill.description}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground">Все умения</p>
            <SkillsShowcase selected={skills} onChange={setSkills} />
          </div>
        </div>
      )}

      {/* ── Step 3: Запуск ── */}
      {step === 3 && (
        <div className="flex flex-col gap-6 max-w-xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Rocket className="size-4 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Всё готово</h1>
            <p className="text-muted-foreground leading-relaxed">
              Проверьте настройки и запустите агента. После запуска вы попадёте в чат с ним.
            </p>
          </div>

          {/* Summary card */}
          <Card className="bg-background dark:bg-transparent border-border/60 py-0">
            <CardContent className="p-6 flex flex-col gap-5">
              {/* Agent identity */}
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-2xl font-bold text-primary-foreground shrink-0">
                  {(name.trim() || "А").charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col gap-0.5">
                  <p className="text-lg font-semibold leading-tight">{name.trim() || "Без названия"}</p>
                  {description && <p className="text-sm text-muted-foreground leading-tight">{description}</p>}
                </div>
              </div>

              <div className="h-px bg-border/60" />

              {/* Goal */}
              <div className="flex flex-col gap-1">
                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">Цель</p>
                <p className="text-sm">
                  {goal ? goal.label : customGoal.trim() || <span className="text-muted-foreground/50">Не указана</span>}
                </p>
              </div>

              {/* Connected skills */}
              <div className="h-px bg-border/60" />
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">Подключённые умения</p>
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map(s => {
                      const skill = SKILLS.find(x => x.id === s.id)
                      if (!skill) return null
                      const Icon = ICON_MAP[skill.icon]
                      return (
                        <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border border-primary/30 bg-primary/5 text-primary">
                          {Icon && <Icon className="size-3" />}
                          {skill.name}
                        </span>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground/50">Нет подключённых умений — можно добавить позже</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bottom bar */}
      <div className="sticky bottom-0 -mx-4 md:-mx-10 -mb-4 md:-mb-10 bg-surface-bg border-t border-white/5 rounded-b-[24px] px-4 md:px-10 pt-4 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step === STEPS.length - 1 ? (
            <Button size="lg" onClick={handleCreate} className="gap-2">
              <Rocket className="size-4" />
              Запустить агента
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={() => setStep(s => s + 1)}
              disabled={step === 0 ? !canNext0 : step === 1 ? !canNext1 : false}
              className="gap-2"
            >
              Далее
              <ChevronRight className="size-4" />
            </Button>
          )}
          {step > 0 && (
            <Button variant="ghost" size="lg" className="text-muted-foreground" onClick={() => setStep(s => s - 1)}>
              Назад
            </Button>
          )}
        </div>
        {(step === 1 || step === 2) && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground/50 hover:text-muted-foreground"
            onClick={() => setStep(s => s + 1)}
          >
            Пропустить
          </Button>
        )}
      </div>

      {/* Skill config dialog */}
      {dialogSkill && (
        <SkillConfigDialog
          skill={dialogSkill}
          open={dialogSkill !== null}
          onOpenChange={(open) => { if (!open) setDialogSkill(null) }}
          initialConfig={skills.find(s => s.id === dialogSkill.id)?.config}
          isConnected={selectedIds.includes(dialogSkill.id)}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />
      )}
    </AppShell>
  )
}
